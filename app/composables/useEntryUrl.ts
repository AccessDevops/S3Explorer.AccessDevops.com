// The URL the visitor actually arrived on — not the one the router leaves
// behind.
//
// Why this exists: on a prerendered page, Vue Router rewrites `location`
// during hydration. On /buy it replaces the URL with the bare route path
// (query string dropped) and restores it ~25ms later. `onMounted` fires
// inside that window, so `window.location.search` reads as empty there.
// That is exactly why every `/buy?source=desktop_nag` visit was recorded
// with `source: organic`, and why the two paid conversions so far are both
// mis-attributed.
//
// nuxt.config.ts injects a classic inline <script> that snapshots the entry
// URL while the document is still parsing — before any module chunk, so
// before the router exists. These helpers read that snapshot, falling back
// to live `location` only when the snapshot is unavailable (SSR, or a client
// navigation after the first paint).

interface EntrySnapshot {
  search: string
  href: string
  referrer: string
}

function snapshot(): EntrySnapshot | null {
  if (typeof window === 'undefined') return null
  const s = (window as unknown as { __s3eEntry?: EntrySnapshot }).__s3eEntry
  return s && typeof s.search === 'string' ? s : null
}

/** Query string of the entry URL, leading `?` included, '' when there is none. */
export function entrySearch(): string {
  const s = snapshot()
  if (s) return s.search
  return typeof window === 'undefined' ? '' : window.location.search
}

/** Parsed query params of the entry URL. Safe to call from `onMounted`. */
export function entryParams(): URLSearchParams {
  return new URLSearchParams(entrySearch())
}

/** Full URL of the entry, query string included. */
export function entryHref(): string {
  const s = snapshot()
  if (s) return s.href
  return typeof window === 'undefined' ? '' : window.location.href
}

/** `document.referrer` as it was on entry — unaffected by later navigations. */
export function entryReferrer(): string {
  const s = snapshot()
  if (s) return s.referrer
  return typeof document === 'undefined' ? '' : document.referrer
}
