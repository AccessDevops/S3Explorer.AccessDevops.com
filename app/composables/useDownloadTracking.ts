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

export function useDownloadTracking() {
  const posthog = usePostHog()
  const clipboardCopied = ref(false)
  const referralId = ref('')

  function trackPageView(page: string = 'landing', extraProps: Record<string, unknown> = {}) {
    posthog?.capture('website_visited', { page, ...extraProps })
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
    const rid = generateReferralId()
    referralId.value = rid

    // Stitch web ↔ desktop sessions: from this point on, the visitor's
    // distinct_id == their referral_id. The desktop app reads the referral_id
    // from the clipboard at first launch and identifies with the same ID,
    // letting PostHog merge the two sessions automatically.
    posthog?.identify(rid)

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

  return {
    trackPageView,
    trackPlatformDetected,
    trackDownloadClicked,
    trackAllPlatformsOpened,
    trackVideoPlayed,
    trackBuyCtaClicked,
    trackNewsViewed,
    trackResolverFallback,
    clipboardCopied,
    referralId,
  }
}
