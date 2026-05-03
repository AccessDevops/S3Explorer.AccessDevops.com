// Single source of truth for GitHub releases data.
// Replaces the older /api/release (single latest) and /api/news (per_page=20)
// endpoints — this one returns up to 30 releases so the smart download resolver
// can walk back through history when the latest release is missing a build for
// the visitor's platform.
//
// Drafts are filtered server-side. Pre-releases are kept; the client decides
// whether to surface them (default: hidden from both download resolver and /news).

interface RawRelease {
  tag_name: string
  name: string
  published_at: string
  html_url: string
  body: string
  draft: boolean
  prerelease: boolean
  assets: Array<{
    name: string
    browser_download_url: string
    size: number
    content_type: string
  }>
}

// Caching is handled by routeRules in nuxt.config.ts:
//   '/api/releases': { cache: { maxAge: 60, swr: true } }
//
// We deliberately do NOT use defineCachedEventHandler here. Its disk-backed
// cache (.nuxt/cache/nitro/handlers/<name>/*.json) uses an integrity hash
// of the handler code as the invalidation key — which means a stale entry
// stays "valid" forever as long as the handler code is unchanged, even past
// `maxAge`. We hit this in production: a v0.2.2 snapshot survived after
// v0.3.0 was published and the site kept showing v0.2.2 across builds.
// routeRules-based caching uses Nitro's in-memory storage, no integrity
// trickery, no surviving artifacts between builds.
export default defineEventHandler(async () => {
  const headers: Record<string, string> = {
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'S3Explorer-Website',
  }

  // Optional auth: lifts rate limit from 60/h (anonymous) to 5000/h.
  // PAT only needs `public_repo` read scope.
  const token = process.env.GITHUB_TOKEN
  if (token) headers.Authorization = `Bearer ${token}`

  const data = await $fetch<RawRelease[]>(
    'https://api.github.com/repos/AccessDevops/S3Explorer/releases?per_page=30',
    { headers },
  )

  return data.filter(r => !r.draft)
})
