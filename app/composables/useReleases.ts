// Foundation composable for GitHub releases data. All other consumers
// (useGithubRelease, useNews, the OS resolver) build on top of this.
//
// IMPORTANT: every façade calls useReleases() with the same useFetch key
// 'github-releases' so SSR + client share a single cached fetch. Don't
// instantiate useFetch('/api/releases') anywhere else with a different key —
// you'd double-fetch and break the resolver consistency.

export interface ReleaseAsset {
  name: string
  browser_download_url: string
  size: number
  content_type: string
}

export interface Release {
  tag_name: string
  name: string
  published_at: string
  html_url: string
  body: string
  draft: boolean
  prerelease: boolean
  assets: ReleaseAsset[]
}

export interface UseReleasesOptions {
  /** Include pre-release versions in the result. Default: false. */
  includePrereleases?: boolean
}

export function useReleases(options: UseReleasesOptions = {}) {
  const { data, status, error, refresh } = useFetch<Release[]>('/api/releases', {
    key: 'github-releases',
    default: () => [] as Release[],
    // Force refresh() to actually hit /api/releases on the client. The default
    // getCachedData returns nuxtApp.payload.data[key] while isHydrating is true
    // and short-circuits the refresh, so a prerendered page would never see new
    // releases until the next deploy. Verified empirically: zero /api/releases
    // requests fired on home cold load before this override.
    // - 'initial' / undefined cause: serve the prerendered payload (fast hydration).
    // - 'refresh:manual' / 'refresh:hook' cause: return undefined → real fetch.
    getCachedData: (key, nuxtApp, { cause }) => {
      if (cause === 'refresh:manual' || cause === 'refresh:hook') return undefined
      return nuxtApp.payload.data[key] ?? nuxtApp.static.data[key]
    },
  })

  // `useFetch` resets `data` to the default — an empty array — when a refresh
  // fails, which throws away the payload the page was prerendered with. The
  // onMounted refresh below runs on every view, so a single failing request
  // emptied the release list site-wide: /news showed "Couldn't load releases"
  // over a perfectly good server-rendered list of twelve versions, and the
  // hero fell back to a bare "Download from GitHub" button instead of the
  // platform-detected download.
  //
  // Keeping the last non-empty result means a transient API failure degrades
  // to slightly stale data rather than to an empty page. The fallback is the
  // prerendered payload, which is at most one deploy old.
  const lastGood = ref<Release[]>([])
  watch(data, (v) => {
    if (Array.isArray(v) && v.length) lastGood.value = v
  }, { immediate: true })

  const releases = computed(() => {
    const fresh = data.value ?? []
    return (fresh.length ? fresh : lastGood.value).filter(r =>
      !r.draft && (options.includePrereleases || !r.prerelease),
    )
  })

  /** True when the feed is unreachable *and* nothing can be shown instead. */
  const unavailable = computed(() => !!error.value && releases.value.length === 0)

  const latest = computed<Release | null>(() => releases.value[0] ?? null)

  onMounted(() => {
    refresh()
  })

  return {
    releases,
    latest,
    // Only a *first* load is "loading". The onMounted refresh() above flips
    // status back to 'pending' on every page view, and treating that as
    // loading made /news swap its whole release list for a spinner and back:
    // two footer displacements, CLS measured at 0.56 in Chrome and 1.49 p75
    // in the field — six times the "poor" threshold, on a Core Web Vital.
    // Keeping the prerendered list on screen while it refreshes removes the
    // swap entirely; the list updates in place when the fetch resolves.
    loading: computed(() => status.value === 'pending' && releases.value.length === 0),
    error,
    unavailable,
    refresh,
  }
}
