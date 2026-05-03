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

export default defineCachedEventHandler(async () => {
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

  // Filter drafts here so cached payload is smaller and clients can't
  // accidentally surface drafts.
  return data.filter(r => !r.draft)
}, {
  maxAge: 300,
  name: 'github-releases',
})
