import { createHmac, timingSafeEqual, createHash } from 'node:crypto'
import { PostHog } from 'posthog-node'

const POSTHOG_HOST = 'https://eu.i.posthog.com'

// Freemius plans (product 46044). Kept here, server-only, like the Lemon
// Squeezy ids in lemon-squeezy.post.ts.
const LIFETIME_PLAN_ID = 81069
const MONTHLY_PLAN_ID = 81068

// Only the fields read below. A Freemius webhook is an event (as returned by
// the Events API) plus `objects`, the resources it concerns. Ids may come as
// strings or numbers.
interface FreemiusPayment {
  id?: number | string
  type?: string
  gross?: number
  vat?: number
  currency?: string
  plan_id?: number | string
  pricing_id?: number | string
  license_id?: number | string
  subscription_id?: number | string | null
  is_renewal?: boolean
  environment?: number
}

interface FreemiusEvent {
  id?: number | string
  type?: string
  data?: Record<string, unknown>
  objects?: {
    user?: { email?: string }
    payment?: FreemiusPayment
    license?: { id?: number | string, plan_id?: number | string, environment?: number }
    subscription?: { id?: number | string, plan_id?: number | string, license_id?: number | string, environment?: number }
  }
}

// HMAC-SHA256 of the raw body with the product's secret key, hex, in the
// `x-signature` header (Freemius docs, "Validating webhook signatures").
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

function hashEmail(email: string): string {
  return createHash('sha256').update(email.trim().toLowerCase()).digest('hex')
}

function idString(value: unknown): string | null {
  return value === null || value === undefined || value === '' ? null : String(value)
}

function tierOf(planId: unknown): 'lifetime' | 'monthly' | 'unknown' {
  const id = Number(planId)
  if (id === LIFETIME_PLAN_ID) return 'lifetime'
  if (id === MONTHLY_PLAN_ID) return 'monthly'
  return 'unknown'
}

// Freemius event types to the PostHog events the Lemon Squeezy webhook sends,
// so the same dashboards keep working. Anything else is acknowledged (200)
// and logged, not forwarded. Every type here also has to be selected on the
// webhook in the Freemius dashboard (Webhooks → Listeners).
//
// `payment.created` covers the first payment and the renewals (`is_renewal`):
// Freemius documents no separate renewal event. Its docs spell the
// cancellation both `subscription.cancelled` and `subscription.canceled`.
const EVENT_MAP: Record<string, string> = {
  'payment.refund': 'purchase_refunded',
  'subscription.created': 'subscription_started',
  'subscription.cancelled': 'subscription_cancelled',
  'subscription.canceled': 'subscription_cancelled',
  'subscription.renewal.failed': 'subscription_payment_failed',
  // Only a monthly license expires: a lapsed subscription.
  'license.expired': 'subscription_expired',
}

export default defineEventHandler(async (event) => {
  const secret = process.env.FREEMIUS_SECRET_KEY
  const apiKey = process.env.POSTHOG_PROJECT_API_KEY

  if (!secret) {
    console.warn('[Freemius webhook] FREEMIUS_SECRET_KEY not set; rejecting')
    throw createError({ statusCode: 503, statusMessage: 'Webhook handler not configured' })
  }

  const rawBody = await readRawBody(event, 'utf-8')
  if (!rawBody) {
    throw createError({ statusCode: 400, statusMessage: 'Empty body' })
  }

  if (!verifySignature(rawBody, getHeader(event, 'x-signature'), secret)) {
    throw createError({ statusCode: 401, statusMessage: 'Invalid signature' })
  }

  let payload: FreemiusEvent
  try {
    payload = JSON.parse(rawBody) as FreemiusEvent
  } catch {
    throw createError({ statusCode: 400, statusMessage: 'Invalid JSON' })
  }

  const type = payload.type ?? ''
  const objects = payload.objects ?? {}
  const payment = objects.payment
  const license = objects.license
  const subscription = objects.subscription

  const phEvent = type === 'payment.created'
    ? (payment?.is_renewal ? 'subscription_renewed' : 'purchase_completed')
    : EVENT_MAP[type]

  if (!phEvent) {
    // Logged: a type selected in Freemius but missing here looks exactly
    // like one never sent, and the Netlify function log tells them apart.
    console.warn(`[Freemius webhook] no mapping for "${type}"; acknowledged but not forwarded`)
    return { ok: true, event: type, mapped_to: 'ignored' }
  }

  const email = typeof objects.user?.email === 'string' ? objects.user.email : null
  // `license_id` is the join key with the desktop app, which sends the same
  // id as `license_id` on `license_activated` and `license_validated`.
  const licenseId = idString(payment?.license_id ?? license?.id ?? subscription?.license_id ?? payload.data?.license_id)
  const planId = payment?.plan_id ?? license?.plan_id ?? subscription?.plan_id ?? payload.data?.plan_id
  const environment = payment?.environment ?? license?.environment ?? subscription?.environment

  // Same stitching fallback as the Lemon Squeezy webhook: the checkout no
  // longer carries the referral id, so the hashed e-mail, then the license.
  const distinctId = email
    ? `email_${hashEmail(email)}`
    : `license_${licenseId ?? idString(payload.id) ?? 'unknown'}`

  const isRefund = type === 'payment.refund'
  const props = {
    tier: tierOf(planId),
    // Freemius amounts are without VAT, in the payment's currency (EUR for
    // this store). `amount_usd` is only set for a USD payment.
    amount: !isRefund && typeof payment?.gross === 'number' ? payment.gross : null,
    vat: !isRefund && typeof payment?.vat === 'number' ? payment.vat : null,
    amount_usd:
      !isRefund && payment?.currency?.toLowerCase() === 'usd' && typeof payment.gross === 'number'
        ? payment.gross
        : null,
    currency: payment?.currency ? payment.currency.toUpperCase() : null,
    // Only set on refunds, apart from `amount`, so a refund can be
    // subtracted from the sale it cancels.
    refunded_amount: isRefund && typeof payment?.gross === 'number' ? Math.abs(payment.gross) : null,
    license_id: licenseId,
    payment_id: idString(payment?.id ?? payload.data?.payment_id),
    fs_subscription_id: idString(payment?.subscription_id ?? subscription?.id),
    plan_id: idString(planId),
    pricing_id: idString(payment?.pricing_id),
    customer_email_hashed: email ? hashEmail(email) : null,
    source: 'unknown',
    // Freemius environment 1 is the sandbox.
    test_mode: environment === 1,
    fs_event: type,
  }

  if (!apiKey) {
    console.warn('[Freemius webhook] POSTHOG_PROJECT_API_KEY not set; signature ok but capture skipped')
    return { ok: true, event: type, mapped_to: phEvent, captured: false }
  }

  const ph = new PostHog(apiKey, { host: POSTHOG_HOST, flushAt: 1, flushInterval: 0 })
  try {
    ph.capture({ distinctId, event: phEvent, properties: props })
    await ph.shutdown()
  } catch (e: unknown) {
    const message = e instanceof Error ? e.message : String(e)
    console.error('[Freemius webhook] PostHog capture failed:', message)
  }

  return { ok: true, event: type, mapped_to: phEvent, captured: true }
})
