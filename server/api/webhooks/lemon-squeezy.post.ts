import { createHmac, timingSafeEqual, createHash } from 'node:crypto'
import { PostHog } from 'posthog-node'

const POSTHOG_HOST = 'https://eu.i.posthog.com'

// Lemon Squeezy product/variant IDs — kept here (not in shared constants)
// because the webhook is server-only and the IDs aren't sensitive but also
// don't need to be in the client bundle.
const LIFETIME_VARIANT_ID = 1417477
const LIFETIME_PRODUCT_ID = 900999
const MONTHLY_VARIANT_ID = 1417489
const MONTHLY_PRODUCT_ID = 901011

interface LemonAttributes {
  store_id?: number
  customer_id?: number
  user_email?: string
  currency?: string
  total?: number
  total_usd?: number
  product_id?: number
  variant_id?: number
  first_order_item?: {
    product_id?: number
    variant_id?: number
  }
  [key: string]: unknown
}

interface LemonWebhookPayload {
  meta: {
    event_name: string
    custom_data?: Record<string, string>
    test_mode?: boolean
  }
  data: {
    type: string
    id: string | number
    attributes: LemonAttributes
  }
}

function verifySignature(
  rawBody: string,
  signatureHeader: string | undefined,
  secret: string,
): boolean {
  if (!signatureHeader) return false
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex')
  const expectedBuf = Buffer.from(expected, 'utf8')
  const givenBuf = Buffer.from(signatureHeader, 'utf8')
  if (expectedBuf.length !== givenBuf.length) return false
  return timingSafeEqual(expectedBuf, givenBuf)
}

function inferTier(attrs: LemonAttributes): 'lifetime' | 'monthly' | 'unknown' {
  const productId = attrs.product_id ?? attrs.first_order_item?.product_id
  const variantId = attrs.variant_id ?? attrs.first_order_item?.variant_id
  if (variantId === LIFETIME_VARIANT_ID || productId === LIFETIME_PRODUCT_ID) return 'lifetime'
  if (variantId === MONTHLY_VARIANT_ID || productId === MONTHLY_PRODUCT_ID) return 'monthly'
  return 'unknown'
}

function hashEmail(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
}

// Map Lemon Squeezy event names to PostHog event names.
// Anything not in this map is acknowledged (200) but not forwarded.
const EVENT_MAP: Record<string, string> = {
  order_created: 'purchase_completed',
  subscription_created: 'subscription_started',
  subscription_cancelled: 'subscription_cancelled',
  subscription_expired: 'subscription_expired',
}

export default defineEventHandler(async (event) => {
  const secret = process.env.LEMON_SQUEEZY_WEBHOOK_SECRET
  const apiKey = process.env.POSTHOG_PROJECT_API_KEY

  if (!secret) {
    console.warn('[LS webhook] LEMON_SQUEEZY_WEBHOOK_SECRET not set; rejecting')
    throw createError({ statusCode: 503, statusMessage: 'Webhook handler not configured' })
  }

  const rawBody = await readRawBody(event, 'utf-8')
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Empty body' })
  }

  const signature = getHeader(event, 'x-signature')
  if (!verifySignature(rawBody, signature, secret)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  let payload: LemonWebhookPayload
  try {
    payload = JSON.parse(rawBody) as LemonWebhookPayload
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON' })
  }

  const eventName = payload.meta?.event_name
  const customData = payload.meta?.custom_data ?? {}
  const attrs = payload.data?.attributes ?? {}

  const referralId
    = typeof customData.referral_id === 'string' ? customData.referral_id : null
  const source = typeof customData.source === 'string' ? customData.source : null
  const email = typeof attrs.user_email === 'string' ? attrs.user_email : null

  // Stitching strategy:
  //   1. referral_id → matches the web session (best signal)
  //   2. customer_email hashed → stable across orders for repeat customers
  //   3. order_id → fallback so the event still lands somewhere
  const distinctId = referralId
    || (email ? `email_${hashEmail(email)}` : `order_${payload.data.id}`)

  const props = {
    tier: inferTier(attrs),
    amount_usd:
      typeof attrs.total_usd === 'number'
        ? attrs.total_usd / 100
        : typeof attrs.total === 'number'
          ? attrs.total / 100
          : null,
    currency: attrs.currency ?? 'USD',
    store_id: attrs.store_id ?? null,
    order_id: payload.data.id,
    product_id: attrs.product_id ?? attrs.first_order_item?.product_id ?? null,
    variant_id: attrs.variant_id ?? attrs.first_order_item?.variant_id ?? null,
    customer_email_hashed: email ? hashEmail(email) : null,
    source: source ?? 'unknown',
    referral_id: referralId,
    test_mode: !!payload.meta?.test_mode,
    ls_event: eventName,
  }

  const phEvent = EVENT_MAP[eventName]

  if (!phEvent) {
    return { ok: true, event: eventName, mapped_to: 'ignored' }
  }

  if (!apiKey) {
    console.warn('[LS webhook] POSTHOG_PROJECT_API_KEY not set; signature ok but capture skipped')
    return { ok: true, event: eventName, mapped_to: phEvent, captured: false }
  }

  const ph = new PostHog(apiKey, { host: POSTHOG_HOST, flushAt: 1, flushInterval: 0 })
  try {
    ph.capture({ distinctId, event: phEvent, properties: props })
    await ph.shutdown()
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[LS webhook] PostHog capture failed:', message)
    // Swallow — Lemon Squeezy would retry, and the failure is on our side.
  }

  return { ok: true, event: eventName, mapped_to: phEvent, captured: true }
})
