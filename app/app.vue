<script setup lang="ts">
import { SITE } from '~/lib/constants'

// Self-referencing canonical on every page.
//
// Without it the same content is reachable, and indexable, under several
// URLs: `/buy` and `/buy/` (the first 301s to the second, but both get
// crawled and both show up as distinct paths in analytics), and the whole
// site is also served on s3explorer.netlify.app, whose robots.txt allows
// indexing. Splitting ranking signals across those variants is a plausible
// contributor to the site being essentially absent from Google while Bing
// indexes it fine.
//
// The URL is built from the route path rather than from `location`, so it is
// identical in the prerendered HTML and after hydration, and immune to the
// query string the router drops mid-hydration.
const route = useRoute()

const canonical = computed(() => {
  // Netlify serves the trailing-slash form (`/buy` 301s to `/buy/`), so point
  // the canonical at the URL that actually answers 200.
  const path = route.path === '/' ? '/' : `${route.path.replace(/\/+$/, '')}/`
  return `${SITE.domain.replace(/\/+$/, '')}${path}`
})

useHead({
  link: [{ rel: 'canonical', href: canonical }],
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
