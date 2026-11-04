<script setup lang="ts">
import { REPO, SITE } from '~/lib/constants'

// What the app and this site send, in the terms a buyer would ask about.
// Every claim here is checked against the app's telemetry code rather than
// written from memory — the sanitisers that keep bucket names and keys out of
// the payload are tested there, so this page can state it plainly.
const pageUrl = `${SITE.domain}/privacy/`
const title = 'Privacy — S3 Explorer'
const description = 'What S3 Explorer measures, what never leaves your machine, where the data is stored, and how to turn usage analytics off.'

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
            { '@type': 'ListItem', 'position': 2, 'name': 'Privacy', 'item': pageUrl },
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
        Privacy
      </h1>

      <p>
        <strong>In short:</strong> S3 Explorer measures how the app is used, nothing more.
        No bucket name, object key, file content or credential ever leaves your machine,
        and you can turn the measurement off.
      </p>

      <h2>What the app sends</h2>
      <p>
        Which app version, the operating system type (Windows, macOS or Linux), the licence
        tier, the sales popup conversion, and the error code of crashes.
      </p>
      <p>
        There is no account. We never ask for your name or your email address.
      </p>

      <h2>What never leaves your machine</h2>
      <ul>
        <li>Bucket names, object keys, folder paths and tags.</li>
        <li>The contents of any file you open, edit, upload or download.</li>
        <li>Access keys, secrets, endpoints and anything else in a connection profile.</li>
      </ul>

      <h2>Where it goes</h2>
      <p>
        To <a href="https://posthog.com/" target="_blank" rel="noopener noreferrer">PostHog</a>,
        on servers in the European Union. It is used to decide what to build next, and for
        nothing else. It is not sold and not shared.
      </p>

      <h2>Turning it off</h2>
      <p>
        Open <strong>Settings → Advanced → Privacy</strong> and clear the telemetry checkbox.
        Nothing is sent after that, the clipboard is no longer read on a fresh install,
        and anything still waiting to be sent is deleted from your machine.
      </p>

      <h2>This website</h2>
      <p>
        The same analytics records which pages are visited, which downloads are started and
        which search engine or site brought you here. A cookie and a local storage entry hold
        the identifier that links a download to the install that follows it.
      </p>

      <h2>Buying a licence</h2>
      <p>
        Payment is handled by
        <a href="https://www.lemonsqueezy.com/" target="_blank" rel="noopener noreferrer">Lemon Squeezy</a>,
        who sell the licence as merchant of record and hold your billing details under their
        own privacy policy. We never see your card number. When the app checks that a licence
        is valid, it sends the licence key and a machine identifier to Lemon Squeezy so the
        same key cannot be used on an unlimited number of machines.
      </p>

      <h2>Questions</h2>
      <p>
        Ask by <a :href="`${REPO.url}/issues`" target="_blank" rel="noopener noreferrer">opening an issue on GitHub</a>.
      </p>
    </div>
  </div>
</template>
