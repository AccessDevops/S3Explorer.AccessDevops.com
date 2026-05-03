export default defineNuxtConfig({
  compatibilityDate: '2025-07-15',
  devtools: { enabled: true },

  modules: [
    '@nuxtjs/tailwindcss',
    '@nuxtjs/sitemap',
    '@posthog/nuxt',
  ],

  components: [
    {
      path: '~/components',
      pathPrefix: false,
      extensions: ['vue'],
      ignore: ['**/ui/**'],
    },
  ],

  tailwindcss: {
    cssPath: '~/assets/css/main.css',
    configPath: 'tailwind.config.js',
  },

  posthogConfig: {
    publicKey: process.env.POSTHOG_PUBLIC_KEY || '',
    // Reverse proxy via our own domain — bypasses adblockers that filter
    // *.posthog.com. The Netlify redirects in netlify.toml rewrite this
    // path to eu.i.posthog.com on the edge.
    host: 'https://s3explorer.accessdevops.com/relay-Bn3Q',
    clientConfig: {
      // Where the PostHog dashboard actually lives. Used by posthog-js to
      // construct "View in PostHog" links (e.g. in dev tools / replays).
      // Without this, those links would point at our proxy URL.
      ui_host: 'https://eu.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
    },
  },

  site: {
    url: 'https://s3explorer.accessdevops.com',
    name: 'S3 Explorer',
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      title: 'S3 Explorer - The Modern Desktop App for S3-Compatible Storage',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Browse buckets, upload and download files, edit text, preview images and videos. Smart local indexing for ultra-fast navigation across millions of objects. Available on Windows, macOS, and Linux.' },
        // Theme color matches the dark mode background; light mode browsers
        // will render the chrome in their own neutral color.
        { name: 'theme-color', content: '#020817', media: '(prefers-color-scheme: dark)' },
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        { name: 'apple-mobile-web-app-title', content: 'S3 Explorer' },
        // Microsoft / Windows tiles
        { name: 'msapplication-TileColor', content: '#2563eb' },
        { name: 'msapplication-TileImage', content: '/android-chrome-192x192.png' },
        { name: 'msapplication-config', content: 'none' },
        { property: 'og:type', content: 'website' },
        { property: 'og:url', content: 'https://s3explorer.accessdevops.com' },
        { property: 'og:title', content: 'S3 Explorer - The Modern Desktop App for S3-Compatible Storage' },
        { property: 'og:description', content: 'Browse buckets, upload and download files, edit text, preview media. Smart local indexing for ultra-fast navigation. Windows, macOS & Linux.' },
        { property: 'og:image', content: 'https://s3explorer.accessdevops.com/og-image.png' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:title', content: 'S3 Explorer - The Modern Desktop App for S3-Compatible Storage' },
        { name: 'twitter:description', content: 'Browse buckets, upload and download files, edit text, preview media. Smart local indexing for ultra-fast navigation.' },
        { name: 'twitter:image', content: 'https://s3explorer.accessdevops.com/og-image.png' },
      ],
      link: [
        // Favicons — multiple sizes so browsers and crawlers (Google
        // included, which favors multiples of 48) pick the best fit.
        // /favicon.ico at the root path is a fallback for legacy crawlers
        // and IE-era browsers that don't read <link rel="icon">.
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
        { rel: 'icon', type: 'image/png', sizes: '32x32', href: '/favicon.png' },
        { rel: 'icon', type: 'image/png', sizes: '48x48', href: '/favicon-48x48.png' },
        { rel: 'icon', type: 'image/png', sizes: '96x96', href: '/favicon-96x96.png' },
        { rel: 'icon', type: 'image/png', sizes: '192x192', href: '/android-chrome-192x192.png' },
        { rel: 'icon', type: 'image/png', sizes: '512x512', href: '/android-chrome-512x512.png' },
        { rel: 'apple-touch-icon', sizes: '180x180', href: '/apple-touch-icon.png' },
        { rel: 'manifest', href: '/manifest.json' },
        { rel: 'dns-prefetch', href: 'https://api.github.com' },
        { rel: 'dns-prefetch', href: 'https://github.com' },
      ],
    },
  },

  ssr: true,

  nitro: {
    prerender: {
      // /buy doesn't depend on GitHub releases — keep it prerendered for
      // max perf + SEO on this conversion page. / and /news depend on the
      // releases list and need to render dynamically (see routeRules below).
      routes: ['/buy'],
    },
  },

  routeRules: {
    // ISR (Incremental Static Regeneration) on Netlify: edge cache for 60s
    // with stale-while-revalidate. 99% of visitors get an instant edge hit;
    // the first request after expiry triggers a background regen, and
    // subsequent requests during that regen still get the stale cached HTML.
    // Net effect: a new GitHub release is reflected on the site within
    // ~60s (ISR window) + ~60s (API cache below) = ~2 min worst case,
    // without any rebuild needed. See:
    // https://developers.netlify.com/guides/isr-and-advanced-caching-with-nuxt-v4-on-netlify/
    '/': { isr: 60 },
    '/news': { isr: 60 },

    // In-memory cache + SWR on the releases endpoint to avoid hammering
    // the GitHub API (60 req/h anonymous, 5000/h authenticated).
    // Replaces the disk-backed defineCachedEventHandler that was producing
    // stale entries surviving across builds via integrity-keyed invalidation.
    '/api/releases': { cache: { maxAge: 60, swr: true } },
  },

  sitemap: {
    urls: ['/', '/buy', '/news'],
  },
})
