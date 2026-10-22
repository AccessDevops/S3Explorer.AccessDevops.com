import { createHmac, timingSafeEqual, createHash } from 'node:crypto'
import { PostHog } from 'posthog-node'

const POSTHOG_HOST = 'https://eu.i.posthog.com'

// Lemon Squeezy product/variant IDs (LIVE MODE — store moved to live on
// 2026-05-07 via copyToLiveMode from the test mode catalog). Kept here
// (not in shared constants) because the webhook is server-only and the
// IDs aren't sensitive but also don't need to be in the client bundle.
const LIFETIME_VARIANT_ID = 1623113
const LIFETIME_PRODUCT_ID = 1034882
const MONTHLY_VARIANT_ID = 1623111
const MONTHLY_PRODUCT_ID = 1034880

interface LemonAttributes {
  store_id?: number
  customer_id?: number
  user_email?: string
  currency?: string
  total?: number
  total_usd?: number
  product_id?: number
  variant_id?: number
  order_id?: number
  subscription_id?: number
  billing_reason?: string
  refunded?: boolean
  refunded_at?: string
  refunded_amount?: number
  refunded_amount_usd?: number
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
//
// Every entry here also has to be ticked in the Lemon Squeezy webhook
// settings, and one without the other does nothing. `subscription_payment_
// success` was unticked until 2026-10-22: the first renewal of the only
// subscription was charged and never recorded, and because Lemon Squeezy
// does not replay webhooks, that payment is lost for good.
//
// `order_refunded` matters more than its rarity suggests: without it a
// refunded sale stays counted as revenue forever. `subscription_payment_
// failed` is the usual cause of losing a subscriber — an expired card, not
// a decision — and it is the only warning before the subscription expires.
const EVENT_MAP: Record<string, string> = {
  order_created: 'purchase_completed',
  order_refunded: 'purchase_refunded',
  subscription_created: 'subscription_started',
  subscription_cancelled: 'subscription_cancelled',
  subscription_expired: 'subscription_expired',
  subscription_payment_success: 'subscription_renewed',
  subscription_payment_failed: 'subscription_payment_failed',
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

  // Join keys. `data.id` is the order id on order events only: subscription
  // events carry the subscription id there, invoice events the invoice id.
  // The desktop app reads `meta.order_id` from the License API and sends it
  // as `ls_order_id`, so `order_id` here has to be the real order id.
  const dataType = payload.data?.type
  const orderId = dataType === 'orders'
    ? String(payload.data.id)
    : attrs.order_id != null ? String(attrs.order_id) : null
  // Renewals are invoices, and Lemon Squeezy does not document `custom_data`
  // on them: they are tied back to the purchase by subscription id instead.
  const subscriptionId = dataType === 'subscriptions'
    ? String(payload.data.id)
    : attrs.subscription_id != null ? String(attrs.subscription_id) : null

  // The first payment of a subscription is already `purchase_completed`
  // (order_created), so only `renewal` invoices count as renewals. Anything
  // else used to be dropped here and answered 200 without a word, which is
  // the same silent failure that lost the first renewal — a payment the
  // store had taken and the data never showed.
  //
  // So nothing is dropped any more: a non-renewal invoice becomes its own
  // event carrying `billing_reason`, outside the sales figures and therefore
  // unable to double-count, but visible. Lemon Squeezy does not document the
  // values this field takes; this is how we find out, on real traffic,
  // instead of guessing. A trial's first real charge in particular may well
  // not be labelled `renewal`.
  const isNonRenewalInvoice
    = eventName === 'subscription_payment_success' && attrs.billing_reason !== 'renewal'

  // Stitching strategy:
  //   1. referral_id → matches the web session (best signal)
  //   2. customer_email hashed → stable across orders for repeat customers
  //   3. order_id → fallback so the event still lands somewhere
  const distinctId = referralId
    || (email ? `email_${hashEmail(email)}` : `order_${orderId ?? payload.data.id}`)

  const props = {
    // Invoices carry no product id; the monthly plan is the only subscription.
    tier: dataType === 'subscription-invoices' ? 'monthly' : inferTier(attrs),
    amount_usd:
      typeof attrs.total_usd === 'number'
        ? attrs.total_usd / 100
        : typeof attrs.total === 'number'
          ? attrs.total / 100
          : null,
    currency: attrs.currency ?? 'USD',
    store_id: attrs.store_id ?? null,
    order_id: orderId,
    ls_subscription_id: subscriptionId,
    product_id: attrs.product_id ?? attrs.first_order_item?.product_id ?? null,
    variant_id: attrs.variant_id ?? attrs.first_order_item?.variant_id ?? null,
    customer_email_hashed: email ? hashEmail(email) : null,
    source: source ?? 'unknown',
    referral_id: referralId,
    test_mode: !!payload.meta?.test_mode,
    ls_event: eventName,
    // Only set on subscription invoices; this is the field that decides
    // whether a payment counts as a renewal.
    billing_reason: attrs.billing_reason ?? null,
    // Only set on refunds. Kept apart from `amount_usd`, which stays the
    // original order total, so a refund can be subtracted from the sale it
    // cancels rather than replacing it.
    refunded_amount_usd:
      typeof attrs.refunded_amount_usd === 'number'
        ? attrs.refunded_amount_usd / 100
        : typeof attrs.refunded_amount === 'number'
          ? attrs.refunded_amount / 100
          : null,
  }

  const phEvent = isNonRenewalInvoice
    ? 'subscription_payment_other'
    : EVENT_MAP[eventName]

  if (!phEvent) {
    // Logged rather than returned quietly: an event that is ticked in Lemon
    // Squeezy but missing from EVENT_MAP looks exactly like one that was
    // never sent, and the Netlify function log is the only place that can
    // tell them apart afterwards.
    console.warn(`[LS webhook] no mapping for "${eventName}"; acknowledged but not forwarded`)
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
