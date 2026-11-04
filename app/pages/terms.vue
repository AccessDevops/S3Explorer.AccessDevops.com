<script setup lang="ts">
import { REPO, SITE } from '~/lib/constants'

// The selling entity and the governing law are not stated here yet. Lemon
// Squeezy is the merchant of record, so the sale itself has a named seller and
// their terms apply to it; this page covers the licence and the app.
//
// Prices are deliberately not repeated here. /buy/ is the single source for
// them, and a figure copied into a contract page is a figure that goes stale.
const pageUrl = `${SITE.domain}/terms/`
const title = 'Terms — S3 Explorer'
const description = 'What a S3 Explorer licence covers, how many devices it allows, how refunds work, and the limits of the warranty.'

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
          '@type': 'WebPage',
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
            { '@type': 'ListItem', 'position': 2, 'name': 'Terms', 'item': pageUrl },
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
        Terms
      </h1>

      <p>
        These terms cover the use of S3 Explorer and the purchase of a licence.
        Using the app means accepting them.
      </p>

      <h2>The app is free</h2>
      <p>
        S3 Explorer works without a licence, with every feature and up to five connection
        profiles. A dismissible reminder appears from time to time. A licence removes that
        reminder and lifts the profile limit.
      </p>

      <h2>What a licence allows</h2>
      <ul>
        <li>A monthly licence may be active on up to 3 devices at the same time.</li>
        <li>A lifetime licence may be active on up to 5 devices at the same time, and covers every future version.</li>
        <li>The limit counts devices active at once, not activations over time. Deactivate a machine in <strong>Settings → License</strong> to free the slot and use another one.</li>
      </ul>
      <p>
        Current prices are on the <NuxtLink to="/buy/">pricing page</NuxtLink>. A licence is
        personal. It may not be resold, shared or published.
      </p>

      <h2>If a licence expires</h2>
      <p>
        A monthly licence stays active until the end of the paid period, then stops. The app
        keeps working with the free limits. Nothing you have stored is affected.
      </p>

      <h2>Payment and refunds</h2>
      <p>
        Licences are sold by
        <a href="https://www.lemonsqueezy.com/" target="_blank" rel="noopener noreferrer">Lemon Squeezy</a>
        as merchant of record. They handle payment, invoicing, tax and refunds under their own
        terms, and their receipt is your proof of purchase. Refund requests go to them.
      </p>

      <h2>Warranty</h2>
      <p>
        S3 Explorer is provided as it is. It talks to storage you own, with credentials you
        supply, and it can delete and overwrite objects when you ask it to. Keep backups and
        check what you are about to do. We are not liable for data loss, downtime or costs
        charged by your storage provider.
      </p>

      <h2>Changes</h2>
      <p>
        These terms may change as the product does. The version published here is the one
        that applies.
      </p>

      <p>
        Questions: <a :href="`${REPO.url}/issues`" target="_blank" rel="noopener noreferrer">open an issue on GitHub</a>.
      </p>
    </div>
  </div>
</template>
