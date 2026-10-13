<script setup lang="ts">
import { PROVIDERS } from '~/lib/providers'
import { getProviderDetail } from '~/lib/provider-details'
import { PROVIDER_CONTENT, DOCUMENTED_PROVIDER_IDS } from '~/lib/provider-content'
import { SITE } from '~/lib/constants'

// Deliberately absent from the header navigation. This page exists so the
// provider pages are reachable by a crawler from a single hop, and so the
// sitemap has a hub to point at — not to add a section to the site.
const documented = computed(() =>
  DOCUMENTED_PROVIDER_IDS
    .map(id => ({
      id,
      brand: PROVIDERS.find(p => p.id === id),
      detail: getProviderDetail(id)!,
      summary: PROVIDER_CONTENT[id]!.summary,
    }))
    .filter(p => p.brand),
)

// Everything S3 Explorer supports but that has no write-up yet. Shown as the
// same tiles as the home page so the compatibility claim is visible in full,
// and deliberately not linked: a page would be a near-empty template, which
// is worse for both readers and search engines than no page at all.
const undocumented = computed(() =>
  PROVIDERS.filter(p => !DOCUMENTED_PROVIDER_IDS.includes(p.id)),
)

const pageUrl = `${SITE.domain}/providers/`
const title = 'S3 provider connection guides — S3 Explorer'
const description = 'Endpoint formats, credentials, addressing modes and worked examples for connecting S3 Explorer to AWS S3, Cloudflare R2, MinIO, Backblaze B2, Ceph and more.'

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogUrl: pageUrl,
  ogImage: `${SITE.domain}/og-image.png`,
  twitterImage: `${SITE.domain}/og-image.png`,
})

useHead({
  script: [{
    key: 'structured-data',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'CollectionPage',
          '@id': `${pageUrl}#page`,
          'name': title,
          'description': description,
          'url': pageUrl,
          'publisher': { '@id': `${SITE.domain}/#org` },
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE.domain}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'Providers', 'item': pageUrl },
          ],
        },
      ],
    }),
  }],
})
</script>

<template>
  <div class="container section-padding">
    <div class="mx-auto max-w-3xl">
      <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
        Provider connection guides
      </h1>
      <p class="mt-4 text-lg leading-relaxed text-muted-foreground">
        What to put in each field of the connection form, where the values come
        from, and the mistakes that cost an afternoon — one page per provider.
      </p>

      <div class="mt-10 space-y-3">
        <NuxtLink
          v-for="p in documented"
          :key="p.id"
          :to="`/providers/${p.id}/`"
          class="block rounded-xl border border-border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <div class="flex items-center gap-3">
            <div
              class="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded"
              :style="{ backgroundColor: p.brand!.color + '20' }"
            >
              <svg :viewBox="p.brand!.svgViewBox || '0 0 24 24'" class="h-[18px] w-[18px]" xmlns="http://www.w3.org/2000/svg">
                <path :d="p.brand!.svgPath" :fill="p.brand!.color" :stroke="p.brand!.color" stroke-width="0.5" />
              </svg>
            </div>
            <span class="font-medium">{{ p.detail.name }}</span>
          </div>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
            {{ p.summary }}
          </p>
        </NuxtLink>
      </div>

      <!-- Supported, not yet written up -->
      <section class="mt-14 border-t border-border pt-10">
        <h2 class="text-xl font-semibold tracking-tight">
          Also supported
        </h2>
        <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
          S3 Explorer ships a ready-made connection preset for each of these
          too — endpoint format, region list and addressing mode are filled in
          for you. They just do not have a detailed guide yet.
        </p>

        <div class="mt-6 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
          <div
            v-for="p in undocumented"
            :key="p.id"
            class="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium"
          >
            <div
              class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded"
              :style="{ backgroundColor: p.color + '20' }"
            >
              <svg
                :viewBox="p.svgViewBox || '0 0 24 24'"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                class="h-[17px] w-[17px]"
              >
                <path :d="p.svgPath" :fill="p.color" :stroke="p.color" stroke-width="0.5" />
              </svg>
            </div>
            <span class="truncate">{{ p.name }}</span>
          </div>
        </div>

        <p class="mt-6 text-sm text-muted-foreground">
          … and any other S3-compatible service through a custom endpoint.
        </p>
      </section>
    </div>
  </div>
</template>
