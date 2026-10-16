const REFERRAL_ID_STORAGE_KEY = 's3e_referral_id'
const REFERRAL_ID_PATTERN = /^s3e_[a-z0-9]{12}$/

function generateReferralId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  // Use the WebCrypto CSPRNG instead of Math.random(): the latter is
  // predictable / seedable and unsuitable for an identifier shared between
  // web and desktop. crypto.getRandomValues is available in every browser
  // since 2014. The 36-modulo on a uint8 introduces a marginal bias
  // (256 % 36 = 4) — acceptable for an attribution token (not a secret).
  const bytes = new Uint8Array(12)
  crypto.getRandomValues(bytes)
  let id = ''
  for (let i = 0; i < 12; i++) {
    id += chars.charAt(bytes[i]! % chars.length)
  }
  return `s3e_${id}`
}

async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    return false
  }
}

function persistReferralId(rid: string) {
  if (typeof localStorage === 'undefined') return
  try {
    localStorage.setItem(REFERRAL_ID_STORAGE_KEY, rid)
  } catch {
    // localStorage can throw in private mode / quota exceeded — non-critical
  }
}

export function readPersistedReferralId(): string | null {
  if (typeof localStorage === 'undefined') return null
  try {
    const v = localStorage.getItem(REFERRAL_ID_STORAGE_KEY)
    return v && REFERRAL_ID_PATTERN.test(v) ? v : null
  } catch {
    return null
  }
}

// The desktop app appends its own PostHog distinct_id to its /buy links
// (`?rid=`): the referral_id it captured from the clipboard at first launch,
// or its install UUID when it captured none. SSR-safe; call from onMounted.
const APP_DISTINCT_ID_PATTERN = /^(s3e_[a-z0-9]{12}|[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})$/

export function readAppDistinctId(): string | null {
  const v = entryParams().get('rid')
  return v && APP_DISTINCT_ID_PATTERN.test(v) ? v : null
}

type PostHogClient = NonNullable<ReturnType<typeof usePostHog>>

function isIdentified(posthog: PostHogClient): boolean {
  return posthog.get_property('$user_state') === 'identified'
}

// One visitor, one referral_id, for as long as the browser keeps it.
//
// Every click used to mint a fresh id and identify() with it. Once a browser
// is identified, identify() with another id switches it to a new person —
// PostHog never merges two identified persons — so a second click landed on
// a person with no web history: 21 of the first 159 download clicks, each
// sharing its browser session with another person.
//
// - Identified with a referral_id: reuse it.
// - Identified with something else (the app's install UUID, set by /buy):
//   attach a referral_id with alias(), which links a new id to the current
//   person instead of switching to another one.
// - Anonymous: identify() with the persisted id, or a new one. Merging an
//   anonymous browser into a person is always allowed.
function linkReferralId(posthog: PostHogClient | undefined): string {
  if (!posthog) return readPersistedReferralId() ?? generateReferralId()
  if (isIdentified(posthog)) {
    const current = posthog.get_distinct_id()
    if (REFERRAL_ID_PATTERN.test(current)) return current
    const rid = readPersistedReferralId() ?? generateReferralId()
    posthog.alias(rid)
    return rid
  }
  const rid = readPersistedReferralId() ?? generateReferralId()
  posthog.identify(rid)
  return rid
}

// Classifies how the visitor reached the site, in a small bucket vocabulary
// that's stable across pages so PostHog breakdowns are meaningful. Order
// matters: explicit `?source=` query param (set by the desktop nag popup,
// emails, etc.) wins over UTM, which wins over inferred referrer.
//
// SSR-safe: returns 'unknown' if window is not available. Callers should
// invoke this from onMounted or later.
// Search engines get their own bucket. Before this list existed, only Google
// was recognised and every other engine fell through to 'referral' — which is
// how ~60% of the traffic (Bing + DuckDuckGo, both on Microsoft's index) was
// filed as "referral" and the real acquisition channel stayed invisible.
const SEARCH_ENGINES: Array<[string, (host: string) => boolean]> = [
  ['google', h => h.includes('google.')],
  ['bing', h => h === 'bing.com' || h.endsWith('.bing.com')],
  ['duckduckgo', h => h.endsWith('duckduckgo.com')],
  ['yahoo', h => h.includes('search.yahoo.') || h.endsWith('.search.yahoo.com')],
  ['ecosia', h => h.endsWith('ecosia.org')],
  ['qwant', h => h.endsWith('qwant.com')],
  ['brave', h => h.endsWith('search.brave.com')],
  ['startpage', h => h.endsWith('startpage.com')],
  ['yandex', h => h.includes('yandex.')],
  ['baidu', h => h.endsWith('baidu.com')],
]

// AI assistants send small but high-intent traffic and deserve their own
// bucket rather than being lumped into 'referral'.
const AI_ASSISTANTS = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'claude.ai', 'copilot.microsoft.com', 'gemini.google.com']

function classifyHost(host: string): string | null {
  // gemini.google.com must beat the generic `google.` test below.
  if (AI_ASSISTANTS.some(s => host === s || host.endsWith(`.${s}`))) return 'ai_assistant'
  for (const [name, match] of SEARCH_ENGINES) if (match(host)) return name
  return null
}

function classifyTrafficSource(): string {
  if (typeof window === 'undefined') return 'unknown'

  // entryParams()/entryReferrer() read the snapshot taken before the router
  // rewrites the URL during hydration — see useEntryUrl.ts. Reading live
  // `location` here would drop `?source=` on prerendered pages.
  const params = entryParams()
  const explicit = params.get('source')
  if (explicit) {
    if (['desktop_nag', 'desktop_settings', 'desktop_profile_limit', 'email', 'social'].includes(explicit)) return explicit
    return explicit.slice(0, 32) // truncate junk values defensively
  }

  const utm = params.get('utm_source')
  if (utm) {
    const lower = utm.toLowerCase()
    const engine = classifyHost(lower)
    if (engine) return engine
    if (['facebook', 'twitter', 'x', 'linkedin', 'instagram', 'reddit', 'youtube'].some(s => lower.includes(s))) return 'social'
    if (lower === 'newsletter' || lower.includes('email') || lower.includes('mail')) return 'email'
    return utm.slice(0, 32)
  }

  // `?ref=` is what listing sites hand out, and they are exactly the sites
  // that strip the referrer: Product Hunt sends visitors to
  // `/?ref=producthunt` with no Referer header at all, so without this branch
  // a launch day's traffic is indistinguishable from direct. Checked after
  // utm_source because a campaign tag is the more deliberate signal, and
  // before the referrer because there usually is none left to read.
  const refParam = params.get('ref')
  if (refParam) {
    const lower = refParam.toLowerCase()
    const engine = classifyHost(lower)
    if (engine) return engine
    return lower.slice(0, 32)
  }

  const ref = (entryReferrer() || '').toLowerCase()
  if (!ref) return 'direct'
  try {
    const host = new URL(ref).hostname
    if (host === 's3explorer.accessdevops.com' || host === 'www.s3explorer.accessdevops.com') return 'internal'
    const engine = classifyHost(host)
    if (engine) return engine
    if (['facebook.com', 'twitter.com', 'x.com', 'linkedin.com', 'instagram.com', 'reddit.com', 'youtube.com', 't.co', 'l.instagram.com'].some(s => host.endsWith(s))) return 'social'
    return 'referral'
  } catch {
    return 'direct'
  }
}

// Every capture below is written `posthog?.capture(...)`, so when the SDK
// fails to initialise the whole funnel goes silent without a single symptom.
// That is not theoretical: a paying customer reached the checkout with a
// referral_id generated by this very file, yet PostHog recorded none of his
// web session — the clipboard and localStorage writes worked, the captures
// did not. Say so once per page, in the console, so the gap is detectable.
function warnIfTrackingUnavailable(posthog: unknown) {
  if (posthog || typeof window === 'undefined') return
  const w = window as unknown as { __s3eTrackingWarned?: boolean }
  if (w.__s3eTrackingWarned) return
  w.__s3eTrackingWarned = true
  console.warn(
    '[tracking] PostHog is unavailable — downloads and buy clicks will not be recorded. '
    + 'Likely causes: POSTHOG_PUBLIC_KEY missing at build time, the /relay-Bn3Q proxy failing, '
    + 'or a blocker intercepting it.',
  )
}

export function useDownloadTracking() {
  const posthog = usePostHog()
  const clipboardCopied = ref(false)
  const referralId = ref('')

  if (import.meta.client) warnIfTrackingUnavailable(posthog)

  function trackPageView(page: string = 'landing', extraProps: Record<string, unknown> = {}) {
    // Auto-attach a `source` bucket when the caller didn't provide one,
    // so PostHog breakdowns by source on website_visited aren't ~80% null.
    // /buy already passes its own `source` (from the URL query) — that wins.
    const source = (extraProps as { source?: string }).source ?? classifyTrafficSource()
    // `$current_url` is whatever the router left in `location` at capture
    // time, which on a prerendered page is the bare route path for a few
    // milliseconds — that is why `website_visited` reads `/buy` while the
    // matching `$pageview` reads `/buy/?source=desktop_nag`. Record the real
    // entry URL alongside it rather than overriding PostHog's own property.
    const entry_url = import.meta.client ? entryHref() : undefined
    posthog?.capture('website_visited', { page, source, entry_url, ...extraProps })
  }

  function trackPlatformDetected(platform: string) {
    posthog?.capture('platform_detected', { platform })
  }

  async function trackDownloadClicked(options: {
    platform: string
    filename: string
    url: string
    version: string
  }) {
    // Stitch web ↔ desktop sessions: the referral_id is linked to this
    // visitor's person, then copied to the clipboard. The desktop app reads
    // it at first launch and uses it as its distinct_id, so its events land
    // on the same person.
    const rid = linkReferralId(posthog)
    referralId.value = rid

    posthog?.capture('download_clicked', {
      platform: options.platform,
      filename: options.filename,
      version: options.version,
      referral_id: rid,
    })

    persistReferralId(rid)
    clipboardCopied.value = await copyToClipboard(rid)

    return rid
  }

  function trackAllPlatformsOpened() {
    posthog?.capture('all_platforms_opened')
  }

  function trackVideoPlayed() {
    posthog?.capture('demo_video_played')
  }

  function trackBuyCtaClicked(tier: 'monthly' | 'lifetime' | 'free', extraProps: Record<string, unknown> = {}) {
    posthog?.capture('buy_cta_clicked', { tier, ...extraProps })
  }

  function trackNewsViewed() {
    posthog?.capture('news_page_viewed')
  }

  // Fired when the resolver couldn't find ANY release that has an asset for a
  // detected (non-unknown) platform. Symptom of naming convention drift in the
  // upstream Tauri build pipeline (assets renamed or missing). Plug this event
  // into a PostHog alert to catch silent breakages early.
  function trackResolverFallback(platform: string) {
    posthog?.capture('download_resolver_no_match', { platform })
  }

  // /buy?rid=<app distinct_id>: the visitor came from the desktop app. An
  // anonymous browser is merged into the app's person. An identified one is
  // left alone, since PostHog refuses to merge two identified persons; the
  // checkout still carries the app's id in custom_data, so the purchase lands
  // on the app's person either way.
  function linkAppDistinctId(appRid: string) {
    if (posthog && !isIdentified(posthog)) posthog.identify(appRid)
  }

  // `?s3e_internal=1` marks this browser as the team's own, `=0` unmarks it.
  // Its events then carry `internal: true` and its person `is_internal`, which
  // the project's "internal and test users" filter excludes. Nothing is
  // disabled: the events still arrive and stay visible with the filter off.
  function applyInternalFlag() {
    const flag = entryParams().get('s3e_internal')
    if (!posthog || (flag !== '1' && flag !== '0')) return
    if (flag === '1') posthog.register({ internal: true })
    else posthog.unregister('internal')
    posthog.setPersonProperties({ is_internal: flag === '1' })
  }

  return {
    trackPageView,
    trackPlatformDetected,
    trackDownloadClicked,
    trackAllPlatformsOpened,
    trackVideoPlayed,
    trackBuyCtaClicked,
    trackNewsViewed,
    trackResolverFallback,
    linkAppDistinctId,
    applyInternalFlag,
    clipboardCopied,
    referralId,
  }
}
