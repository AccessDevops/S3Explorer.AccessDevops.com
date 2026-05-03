// Façade over useReleases for code that thinks in terms of "the latest release".
// Returns the full list too so the smart resolver in useOsDetection can walk
// back through history when the latest is missing a build for the visitor's OS.
// Type imports (Release, ReleaseAsset): use useReleases.ts as the canonical source.

const GITHUB_RELEASES_URL = 'https://github.com/AccessDevops/S3Explorer/releases'

export function useGithubRelease() {
  const { releases, latest, loading, error } = useReleases()

  const version = computed(() => latest.value?.tag_name ?? '')

  return {
    releases,
    latest,
    version,
    releasesPageUrl: GITHUB_RELEASES_URL,
    loading,
    error,
  }
}
