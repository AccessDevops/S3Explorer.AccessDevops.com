<script setup lang="ts">
import { REPO, SITE } from '~/lib/constants'

// Who publishes the site and how the guides are made. Google's guidance on
// helpful content asks for exactly this ("who, how, why"), and the guides'
// bylines link here. Kept to facts the reader can check.
const pageUrl = `${SITE.domain}/about/`
const title = 'About — S3 Explorer'
const description = 'Who builds S3 Explorer and publishes this site, why the app exists, and how the guides are researched, dated and corrected.'

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
          '@type': 'AboutPage',
          '@id': `${pageUrl}#page`,
          'name': title,
          'description': description,
          'url': pageUrl,
          'mainEntity': { '@id': `${pageUrl}#author` },
          'publisher': { '@id': `${SITE.domain}/#org` },
        },
        {
          '@type': 'Person',
          '@id': `${pageUrl}#author`,
          'name': 'Clement Baranger',
          'url': 'https://cbarange.com/',
          'sameAs': ['https://cbarange.com/', 'https://github.com/cbarange'],
          'worksFor': { '@id': `${SITE.domain}/#org` },
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE.domain}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'About', 'item': pageUrl },
          ],
        },
      ],
    }),
  }],
})
</script>

<template>
  <div class="container section-padding">
    <div class="guide-body mx-auto max-w-3xl">
      <h1 class="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
        About
      </h1>

      <p>
        S3 Explorer and this site are built by
        <a href="https://cbarange.com/" target="_blank" rel="noopener noreferrer">Clement Baranger</a>
        and published under <a :href="`https://github.com/${REPO.org}`" target="_blank" rel="noopener noreferrer">AccessDevops</a>.
      </p>

      <h2>Why S3 Explorer</h2>
      <p>
        It was built to manage buckets spread across several S3-compatible providers
        from one secure, local interface, on Windows, macOS and Linux.
      </p>

      <h2>How the guides are written</h2>
      <ul>
        <li>Facts come from the official documentation and price lists of each product, linked in the Sources section of every guide.</li>
        <li>Every guide shows the date it was last updated. Prices and comparisons are checked again when that date changes.</li>
        <li>Comparisons are written by the publisher of S3 Explorer, say so, and include what the other product does better.</li>
      </ul>

      <h2>Corrections and contact</h2>
      <p>
        To report an error or a change at a provider, <a :href="`${REPO.url}/issues`" target="_blank" rel="noopener noreferrer">open an issue on GitHub</a>.
        The source of this site is public in
        <a :href="`https://github.com/${REPO.org}/S3Explorer.AccessDevops.com`" target="_blank" rel="noopener noreferrer">its repository</a>.
      </p>
    </div>
  </div>
</template>
