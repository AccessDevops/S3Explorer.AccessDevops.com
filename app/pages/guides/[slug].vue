<script setup lang="ts">
import { PhArrowLeft, PhDownloadSimple } from '@phosphor-icons/vue'
import { getGuide } from '~/lib/guides'
import { PROVIDERS } from '~/lib/providers'
import { DOCUMENTED_PROVIDER_IDS } from '~/lib/provider-content'
import { SITE } from '~/lib/constants'

const route = useRoute()
const guide = getGuide(String(route.params.slug))

if (!guide) {
  throw createError({ statusCode: 404, statusMessage: 'Guide not found', fatal: true })
}

const g = guide
const pageUrl = `${SITE.domain}/guides/${g.slug}/`
const image = `${SITE.domain}${g.image ?? '/og-image.png'}`

// The brand suffix is dropped when the guide already names the product,
// e.g. a comparison: "… S3 Explorer vs … — S3 Explorer" wastes the part of
// the title a search result shows.
const pageTitle = g.title.includes('S3 Explorer') ? g.title : `${g.title} — S3 Explorer`

useSeoMeta({
  title: pageTitle,
  description: g.description,
  ogType: 'article',
  ogTitle: g.title,
  ogDescription: g.description,
  ogUrl: pageUrl,
  ogImage: image,
  ogImageAlt: g.imageAlt,
  twitterImage: image,
  articlePublishedTime: g.published,
  articleModifiedTime: g.updated,
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
          '@type': 'TechArticle',
          '@id': `${pageUrl}#article`,
          'headline': g.title,
          'description': g.description,
          'datePublished': g.published,
          'dateModified': g.updated,
          'image': image,
          'url': pageUrl,
          'mainEntityOfPage': pageUrl,
          'about': { '@type': 'SoftwareApplication', 'name': 'S3 Explorer', 'url': `${SITE.domain}/` },
          // Same entity as on /about/; name and url repeated because
          // consumers do not always resolve an @id defined on another page.
          'author': { '@type': 'Person', '@id': `${SITE.domain}/about/#author`, 'name': 'Clement Baranger', 'url': `${SITE.domain}/about/` },
          'publisher': { '@id': `${SITE.domain}/#org` },
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE.domain}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'Guides', 'item': `${SITE.domain}/guides/` },
            { '@type': 'ListItem', 'position': 3, 'name': g.title, 'item': pageUrl },
          ],
        },
      ],
    }),
  }],
})

// Links to the provider guides this article is about: the internal links
// that let a crawler move between the two sections.
const relatedProviders = PROVIDERS.filter(p =>
  g.providers.includes(p.id) && DOCUMENTED_PROVIDER_IDS.includes(p.id))

function formatDate(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
  })
}
</script>

<template>
  <div class="container section-padding">
    <article class="mx-auto max-w-3xl">
      <NuxtLink
        to="/guides/"
        class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <PhArrowLeft :size="15" />
        All guides
      </NuxtLink>

      <h1 class="mt-6 text-3xl font-bold tracking-tight sm:text-4xl">
        {{ g.title }}
      </h1>
      <!-- Visible byline: the JSON-LD names an author, and Google asks for
           structured data to match what the page shows. -->
      <p class="mt-3 text-sm text-muted-foreground">
        By <NuxtLink to="/about/" rel="author" class="underline-offset-4 hover:text-foreground hover:underline">Clement Baranger</NuxtLink>
        · <time :datetime="g.updated">Updated {{ formatDate(g.updated) }}</time>
      </p>

      <div class="guide-body mt-8" v-html="g.html" />

      <template v-if="relatedProviders.length">
        <h2 class="mt-12 text-sm font-semibold">
          Connection guides
        </h2>
        <ul class="mt-3 flex flex-wrap gap-x-4 gap-y-2 text-sm">
          <li v-for="p in relatedProviders" :key="p.id">
            <NuxtLink :to="`/providers/${p.id}/`" class="text-muted-foreground underline-offset-4 hover:text-foreground hover:underline">
              {{ p.name }}
            </NuxtLink>
          </li>
        </ul>
      </template>

      <div class="mt-12 flex justify-end border-t border-border pt-8">
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PhDownloadSimple :size="17" />
          Download S3 Explorer
        </NuxtLink>
      </div>
    </article>
  </div>
</template>
