<script setup lang="ts">
import { GUIDES } from '~/lib/guides'
import { SITE } from '~/lib/constants'

// Deliberately absent from the header navigation, like /providers/. It is
// reached from the footer and from the provider pages: a hub one hop away for
// crawlers, without adding a section to the site.
const pageUrl = `${SITE.domain}/guides/`
const title = 'S3 guides — S3 Explorer'
const description = 'Technical guides for working with S3-compatible object storage: AWS S3, Cloudflare R2, Backblaze B2, MinIO, Garage, SeaweedFS and more.'

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
  link: [{ rel: 'alternate', type: 'application/rss+xml', title: 'S3 Explorer guides', href: `${SITE.domain}/guides/rss.xml` }],
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
          'hasPart': GUIDES.map(g => ({
            '@type': 'TechArticle',
            'headline': g.title,
            'url': `${pageUrl}${g.slug}/`,
            'dateModified': g.updated,
          })),
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE.domain}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'Guides', 'item': pageUrl },
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
        Guides
      </h1>
      <p class="mt-4 text-lg leading-relaxed text-muted-foreground">
        Working with S3-compatible object storage, across providers.
      </p>

      <ul class="mt-10 divide-y divide-border border-y border-border">
        <li v-for="g in GUIDES" :key="g.slug" class="py-5">
          <NuxtLink :to="`/guides/${g.slug}/`" class="group block">
            <h2 class="font-semibold tracking-tight group-hover:underline group-hover:underline-offset-4">
              {{ g.title }}
            </h2>
            <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
              {{ g.description }}
            </p>
          </NuxtLink>
        </li>
      </ul>
    </div>
  </div>
</template>
