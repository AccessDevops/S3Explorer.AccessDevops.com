export const SITE = {
  name: 'S3 Explorer',
  domain: 'https://s3explorer.accessdevops.com',
  tagline: 'The modern desktop app for S3-compatible storage',
}

export const REPO = {
  org: 'AccessDevops',
  name: 'S3Explorer',
  url: 'https://github.com/AccessDevops/S3Explorer',
  releasesUrl: 'https://github.com/AccessDevops/S3Explorer/releases',
}

// Pre-filled GitHub issue body. Sent via ?body= query string when the user
// clicks "Report issue" in the header. Markdown comments give hints in the
// editor without cluttering the rendered issue.
const ISSUE_TEMPLATE = `## Type of report
- [ ] 🐛 Bug — something is broken or behaves unexpectedly
- [ ] ✨ Feature request — I'd like S3 Explorer to do something new
- [ ] 📚 Documentation or wording
- [ ] ❓ Question or other

## Description
<!-- What happened, or what you'd like to see. Be as specific as you can. -->


## Why it matters
<!-- The use case, the impact, why this is worth doing. Helps us prioritize. -->


## Steps to reproduce (bug only)
1.
2.
3.

## Environment (bug only)
- S3 Explorer version:
- OS:
- S3 provider:

## Screenshot or screen recording
<!-- Drag-and-drop an image or short clip here. Optional but very helpful
     for visual issues. -->


## Anything else
<!-- Logs, related links, anything that adds context. -->
`

export const REPORT_ISSUE_URL
  = `${REPO.url}/issues/new?body=${encodeURIComponent(ISSUE_TEMPLATE)}`

export const LEMON_SQUEEZY = {
  storeUrl: 'https://s3explorer.lemonsqueezy.com',
  // Monthly subscription — product 1034880, variant 1623111 (live mode)
  checkoutMonthly: 'https://s3explorer.lemonsqueezy.com/checkout/buy/f613d0eb-54a7-4f6c-939f-d5d51739f9ab',
  // Lifetime — product 1034882, variant 1623113 (live mode)
  checkoutLifetime: 'https://s3explorer.lemonsqueezy.com/checkout/buy/918b4b1f-bc7b-430b-8b65-05cef8abc472',
}

// Append checkout custom_data to a Lemon Squeezy checkout URL so the values
// come back in the order webhook payload (under `meta.custom_data`).
// Lemon Squeezy syntax: ?checkout[custom][key]=value
// Used to stitch web sessions (referral_id) and identify traffic source
// (organic, desktop_nag, …) all the way to the purchase event in PostHog.
export function buildCheckoutUrl(
  baseUrl: string,
  customData: Record<string, string | null | undefined>,
): string {
  const params = new URLSearchParams()
  for (const [key, value] of Object.entries(customData)) {
    if (value) params.set(`checkout[custom][${key}]`, value)
  }
  const qs = params.toString()
  if (!qs) return baseUrl
  return `${baseUrl}${baseUrl.includes('?') ? '&' : '?'}${qs}`
}

export const PRICING = {
  free: {
    label: 'Free',
    price: '0 €',
    cadence: 'forever',
    profileLimit: 5,
  },
  monthly: {
    label: 'Monthly',
    price: '1,99 €',
    cadence: '/month',
  },
  lifetime: {
    label: 'Lifetime',
    price: '11,50 €',
    cadence: 'one-time',
    badge: 'Best value',
  },
}

// PROVIDERS list moved to ~/lib/providers.ts (with SVG paths mirrored from the desktop app)
