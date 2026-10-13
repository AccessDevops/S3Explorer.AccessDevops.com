import { DOCUMENTED_PROVIDER_IDS } from './app/lib/provider-content'

// Evaluated once per build. Used as `lastmod` in the sitemap: these pages are
// prerendered, so a rebuild is precisely when their content can change.
const BUILD_TIME = new Date().toISOString()

// Provider guides, derived from the single list of providers we have actually
// written up. Adding an entry to provider-content.ts is therefore enough to
// get the page prerendered AND listed in the sitemap — there is no second
// place to remember to update.
//
// Prerendering these is not an optimisation, it is a requirement: rendering
// them through the Netlify function hits the EMFILE ceiling described in the
// `nitro.prerender` comment below, and these pages import the same icon
// package that caused it.
const PROVIDER_ROUTES = DOCUMENTED_PROVIDER_IDS.map(id => `/providers/${id}`)

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
    // Netlify answers 200 on `/buy/` and 301s `/buy` to it. Telling the SEO
    // modules so keeps the sitemap on the same URLs as the canonical in
    // app/app.vue — otherwise @nuxtjs/sitemap normalises the slash away and
    // advertises URLs that redirect.
    trailingSlash: true,
  },

  app: {
    head: {
      htmlAttrs: { lang: 'en' },
      script: [
        {
          // Snapshot the entry URL while the document is still parsing.
          //
          // Vue Router rewrites `location` during hydration on prerendered
          // pages: on /buy it briefly replaces the URL with the bare route
          // path — query string dropped — and restores it ~25ms later.
          // `onMounted` runs inside that window, so reading
          // `window.location.search` there yields '' and every desktop_nag
          // visit was recorded as `organic`. Measured on production: the URL
          // is bare between t+1709ms and t+1736ms.
          //
          // A classic inline script runs before any module chunk, so this
          // always observes the real entry URL. Read it via useEntryUrl().
          innerHTML: 'window.__s3eEntry={search:location.search,href:location.href,referrer:document.referrer}',
          tagPosition: 'head',
        },
      ],
      title: 'S3 Explorer - The Modern Desktop App for S3-Compatible Storage',
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: 'Browse buckets, upload and download files, edit text, preview images and videos. Smart local indexing for ultra-fast navigation across millions of objects. Available on Windows, macOS, and Linux.' },
        // Theme color matches the dark mode background; light mode browsers
        // will render the chrome in their own neutral color.
        { name: 'theme-color', content: '#020817', media: '(prefers-color-scheme: dark)' },
        { name: 'theme-color', content: '#ffffff', media: '(prefers-color-scheme: light)' },
        // Bing Webmaster Tools site ownership. Bing re-checks this tag
        // periodically, not just once — removing it revokes access to the
        // search performance data. Google's equivalent is the static file
        // public/google79cda1e6e473c205.html.
        //
        // This matters more here than it looks: Bing and DuckDuckGo (same
        // index) account for roughly 60% of the site's traffic, against six
        // visitors from Google in five months. This console is the only place
        // that shows which queries actually bring those people in.
        { name: 'msvalidate.01', content: '389CE3BD52C38ADCCF3E38D0262AC140' },
        { name: 'apple-mobile-web-app-title', content: 'S3 Explorer' },
        // Microsoft / Windows tiles
        { name: 'msapplication-TileColor', content: '#2563eb' },
        { name: 'msapplication-TileImage', content: '/android-chrome-192x192.png' },
        { name: 'msapplication-config', content: 'none' },
        { property: 'og:type', content: 'website' },
        // Named site + locale + explicit image dimensions: without them
        // Open Graph consumers (and Google's own preview) have to fetch and
        // measure the image before they can lay the card out.
        { property: 'og:site_name', content: 'S3 Explorer' },
        { property: 'og:locale', content: 'en_US' },
        { property: 'og:image:width', content: '1200' },
        { property: 'og:image:height', content: '630' },
        { property: 'og:image:alt', content: 'S3 Explorer — desktop app for S3-compatible storage' },
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
      // Keep / and /news prerendered for now: rendering them as SSR via
      // Netlify Function blows past the Lambda file-descriptor limit because
      // @phosphor-icons/vue ships thousands of per-icon .vue.mjs files and
      // they're all loaded during cold start (EMFILE). Until we bundle the
      // icon imports into a single chunk on the server side, prerender is
      // the only option that works. /buy already had no release dependency,
      // unchanged.
      // The 404 page is NOT prerendered here: Nitro emits an empty SPA shell
      // for /404.html rather than rendering the error component, so it only
      // becomes readable after hydration — which a crawler never waits for.
      // public/404.html is a hand-written static page instead, and Netlify
      // serves it for unmatched paths now that the catch-all is narrowed.
      routes: ['/', '/buy', '/news', '/providers', ...PROVIDER_ROUTES],
    },
  },

  routeRules: {
    // In-memory cache + SWR on the releases endpoint. Replaces the
    // disk-backed defineCachedEventHandler whose integrity-keyed entries
    // were surviving across builds and serving stale data (a v0.2.2
    // snapshot persisted after v0.3.0 was published). Memory cache means
    // every fresh build starts with a clean slate.
    '/api/releases': { cache: { maxAge: 60, swr: true } },
  },

  sitemap: {
    // Trailing slashes match what the server actually returns 200 for and what
    // the canonical points at — `/buy` 301s to `/buy/`, so listing the bare
    // form sent every crawl through a redirect for nothing.
    //
    // `lastmod` is the build timestamp. It is the honest value here: the pages
    // are prerendered, so their content only changes when the site is rebuilt.
    // It also gives crawlers a reason to come back to /news after a release —
    // provided the release pipeline triggers a rebuild (see README).
    urls: [
      { loc: '/', lastmod: BUILD_TIME },
      { loc: '/buy/', lastmod: BUILD_TIME },
      { loc: '/news/', lastmod: BUILD_TIME },
      // Hub first, then one guide per documented provider. Dynamic routes are
      // invisible to the module's auto-discovery, so they are listed here.
      { loc: '/providers/', lastmod: BUILD_TIME },
      ...PROVIDER_ROUTES.map(r => ({ loc: `${r}/`, lastmod: BUILD_TIME })),
    ],
  },
})
