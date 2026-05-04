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

  const releases = computed(() =>
    (data.value ?? []).filter(r =>
      !r.draft && (options.includePrereleases || !r.prerelease),
    ),
  )

  const latest = computed<Release | null>(() => releases.value[0] ?? null)

  onMounted(() => {
    refresh()
  })

  return {
    releases,
    latest,
    loading: computed(() => status.value === 'pending'),
    error,
    refresh,
  }
}
