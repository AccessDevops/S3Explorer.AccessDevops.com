// Façade over useReleases for the /news page. Pre-releases are filtered out
// by useReleases default — switch options.includePrereleases if a beta channel
// is ever introduced. Type imports: use useReleases.ts as the canonical source
// (don't re-export from here, it triggers Nuxt auto-import duplication warnings
// that conflict with NewsRelease defined locally in useStructuredData).

export function useNews() {
  const { releases, loading, error, refresh } = useReleases()
  return {
    releases,
    loading,
    error,
    refresh,
  }
}
