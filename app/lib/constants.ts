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

// Freemius hosted checkout, product 46044. Monthly: plan 81068 (pricing
// 122882). Lifetime: plan 81069 (pricing 122878). The dashboard's
// Plans → "Get Checkout" link is the reference for these URLs.
// `trial=paid`: without it the checkout charges at once and shows no trial;
// with it, 5-day trial, card taken up front, charged when the trial ends.
export const CHECKOUT = {
  monthly: 'https://checkout.freemius.com/product/46044/plan/81068/?trial=paid',
  lifetime: 'https://checkout.freemius.com/product/46044/plan/81069/',
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
    price: '2,90 €',
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
