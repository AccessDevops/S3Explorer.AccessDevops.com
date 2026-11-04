<script setup lang="ts">
import { REPO, SITE } from '~/lib/constants'

// Where the credentials live and what the app talks to. This is as much a
// buying question as a legal one: the usual objection to a desktop S3 client
// is that it might ship your keys somewhere, so the answer belongs on a page
// of its own rather than buried in a guide.
const pageUrl = `${SITE.domain}/security/`
const title = 'Security — S3 Explorer'
const description = 'Where S3 Explorer stores your access keys, why your storage traffic never passes through us, and every host the app contacts.'

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
            { '@type': 'ListItem', 'position': 2, 'name': 'Security', 'item': pageUrl },
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
        Security
      </h1>

      <p>
        <strong>In short:</strong> your access keys stay on your machine, encrypted, and your
        storage traffic goes straight from your machine to the endpoints you configure. There
        is no server of ours in the middle.
      </p>

      <h2>Your credentials</h2>
      <p>
        Connection profiles are stored encrypted on disk, in your user configuration
        directory. They are never transmitted to us, and no part of a profile appears in
        usage analytics — see the <NuxtLink to="/privacy/">privacy page</NuxtLink>.
      </p>

      <h2>Your data</h2>
      <p>
        Listings, uploads, downloads and previews are direct requests from the app to the S3
        endpoint you entered, signed with your own credentials. Nothing is relayed, cached or
        copied anywhere else. The local search index is built on your machine and stays there.
      </p>

      <h2>What else the app contacts</h2>
      <ul>
        <li><code>api.lemonsqueezy.com</code> — checking that a licence is valid.</li>
        <li><code>eu.i.posthog.com</code> — usage analytics, which you can turn off.</li>
        <li><code>github.com</code> — looking for a new version, and downloading it.</li>
        <li><code>www.google.com</code> and <code>www.cloudflare.com</code> — reading the date they return, to notice a clock that has been set back to extend a licence.</li>
        <li><code>1.1.1.1</code> and <code>dns.google</code> — resolving the licence server when the system resolver returns nothing.</li>
      </ul>

      <h2>Updates</h2>
      <p>
        Releases are published on
        <a :href="REPO.releasesUrl" target="_blank" rel="noopener noreferrer">GitHub</a>
        and signed. The app verifies that signature before installing an update, so a
        tampered download is refused.
      </p>

      <h2>Reporting a vulnerability</h2>
      <p>
        <a :href="`${REPO.url}/issues`" target="_blank" rel="noopener noreferrer">Open an issue on GitHub</a>
        saying that you have found a security problem, without the details. We will answer
        and agree on a private channel before you share anything exploitable.
      </p>
    </div>
  </div>
</template>
