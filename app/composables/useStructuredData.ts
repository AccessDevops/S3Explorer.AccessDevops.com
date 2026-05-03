// Schema.org JSON-LD helpers for SEO rich snippets.
// One composable per page, each injects an @graph of typed entities into <head>.
//
// Reference: https://schema.org/docs/full.html
// Test with: https://search.google.com/test/rich-results

const SITE_URL = 'https://s3explorer.accessdevops.com'

const ORGANIZATION = {
  '@type': 'Organization',
  '@id': `${SITE_URL}/#org`,
  'name': 'AccessDevops',
  'url': 'https://github.com/AccessDevops',
  'logo': `${SITE_URL}/icon-256.png`,
} as const

function injectJsonLd(data: unknown) {
  useHead({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(data),
      },
    ],
  })
}

// -----------------------------------------------------------------------------
// Home page — SoftwareApplication
// -----------------------------------------------------------------------------

export function useHomeStructuredData(version: string) {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      {
        '@type': 'SoftwareApplication',
        '@id': `${SITE_URL}/#app`,
        'name': 'S3 Explorer',
        'description': 'The modern desktop app for S3-compatible storage. Browse buckets, upload and download files, edit text, preview images and videos. Smart local indexing for ultra-fast navigation across millions of objects.',
        'applicationCategory': 'DeveloperApplication',
        'applicationSubCategory': 'Cloud Storage Manager',
        'operatingSystem': 'Windows 10+, macOS 11+, Linux x64 / aarch64',
        'softwareVersion': version,
        'downloadUrl': 'https://github.com/AccessDevops/S3Explorer/releases',
        'installUrl': SITE_URL,
        'releaseNotes': `${SITE_URL}/news`,
        'image': `${SITE_URL}/og-image.png`,
        'screenshot': `${SITE_URL}/og-image.png`,
        'url': SITE_URL,
        'inLanguage': ['en', 'fr', 'es', 'pt', 'zh', 'hi', 'ar', 'bn', 'id', 'ro'],
        'offers': [
          {
            '@type': 'Offer',
            'name': 'Free',
            'price': '0',
            'priceCurrency': 'USD',
            'description': 'All features, up to 5 connection profiles. Free forever.',
            'availability': 'https://schema.org/InStock',
            'url': SITE_URL,
          },
          {
            '@type': 'Offer',
            'name': 'Lifetime License',
            'price': '11.50',
            'priceCurrency': 'USD',
            'description': 'Unlimited profiles, no reminder popup, one-time payment, up to 5 active devices.',
            'availability': 'https://schema.org/InStock',
            'url': 'https://s3explorer.lemonsqueezy.com/checkout/buy/2c0aba4d-fd2e-4f40-a8a8-f3b7af1892b9',
          },
          {
            '@type': 'Offer',
            'name': 'Monthly Subscription',
            'price': '1.99',
            'priceCurrency': 'USD',
            'description': 'Unlimited profiles, no reminder popup, billed monthly with 5-day free trial, up to 3 active devices.',
            'availability': 'https://schema.org/InStock',
            'url': 'https://s3explorer.lemonsqueezy.com/checkout/buy/859ffcff-6e2b-4c1a-9556-9e41d85df17c',
          },
        ],
        'featureList': [
          'Compatible with all S3-compatible providers (AWS S3, GCS, MinIO, Backblaze, Wasabi, Cloudflare R2, OVH, DigitalOcean Spaces, Scaleway, IDrive e2, Storj, and more)',
          'Ultra-fast navigation with smart local indexing',
          'Full file management with drag & drop',
          'Built-in text and image editor',
          'Media preview for images, videos, and audio',
          'Multipart and parallel uploads for large files',
          'Object versioning, tags, and metadata management',
          'Presigned URL generator',
          'Dashboard metrics and bucket statistics',
          'Dark mode and compact view',
          '10 languages supported',
          'Cross-Platform: Windows, macOS, Linux (x64 + ARM64)',
          'Auto-update with Ed25519 signature verification',
        ],
        'author': ORGANIZATION,
        'publisher': ORGANIZATION,
      },
      {
        '@type': 'WebSite',
        '@id': `${SITE_URL}/#website`,
        'name': 'S3 Explorer',
        'url': SITE_URL,
        'description': 'The modern desktop app for S3-compatible storage',
        'inLanguage': 'en',
        'publisher': { '@id': `${SITE_URL}/#org` },
      },
    ],
  }

  injectJsonLd(data)
}

// -----------------------------------------------------------------------------
// Buy page — Product + FAQPage + BreadcrumbList
// -----------------------------------------------------------------------------

export interface BuyTier {
  name: string
  price: string
  cadence: string
  description: string
  url: string
}

export interface BuyFaq {
  q: string
  a: string
}

export function useBuyStructuredData(opts: { tiers: BuyTier[], faqs: BuyFaq[] }) {
  const data = {
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      {
        '@type': 'Product',
        '@id': `${SITE_URL}/buy#product`,
        'name': 'S3 Explorer License',
        'description': 'Optional license for S3 Explorer. Unlocks unlimited connection profiles, removes the reminder popup, and supports continued development. The app itself is free without a license.',
        'image': `${SITE_URL}/og-image-buy.png`,
        'url': `${SITE_URL}/buy`,
        'brand': {
          '@type': 'Brand',
          'name': 'S3 Explorer',
        },
        'category': 'Software License',
        'offers': opts.tiers.map(tier => ({
          '@type': 'Offer',
          'name': tier.name,
          'price': tier.price.replace(/[^0-9.]/g, ''),
          'priceCurrency': 'USD',
          'description': `${tier.description} — ${tier.cadence}.`,
          'availability': 'https://schema.org/InStock',
          'url': tier.url,
          'seller': { '@id': `${SITE_URL}/#org` },
        })),
      },
      {
        '@type': 'FAQPage',
        '@id': `${SITE_URL}/buy#faq`,
        'mainEntity': opts.faqs.map(faq => ({
          '@type': 'Question',
          'name': faq.q,
          'acceptedAnswer': {
            '@type': 'Answer',
            'text': faq.a,
          },
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/buy#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': SITE_URL,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'Get a License',
            'item': `${SITE_URL}/buy`,
          },
        ],
      },
    ],
  }

  injectJsonLd(data)
}

// -----------------------------------------------------------------------------
// News page — Blog + BlogPosting[] + BreadcrumbList
// -----------------------------------------------------------------------------

export interface NewsRelease {
  tag_name: string
  name: string
  published_at: string
  html_url: string
  body?: string
}

export function useNewsStructuredData(releases: Ref<NewsRelease[]>) {
  const data = computed(() => ({
    '@context': 'https://schema.org',
    '@graph': [
      ORGANIZATION,
      {
        '@type': 'Blog',
        '@id': `${SITE_URL}/news#blog`,
        'name': 'S3 Explorer — News & Releases',
        'description': 'Every published version of S3 Explorer, with full release notes. The desktop app reads from this same feed.',
        'url': `${SITE_URL}/news`,
        'inLanguage': 'en',
        'publisher': { '@id': `${SITE_URL}/#org` },
        'image': `${SITE_URL}/og-image-news.png`,
        'blogPost': releases.value.map(release => ({
          '@type': 'BlogPosting',
          'headline': release.name || release.tag_name,
          'datePublished': release.published_at,
          'url': release.html_url,
          'mainEntityOfPage': release.html_url,
          'image': `${SITE_URL}/og-image-news.png`,
          'author': { '@id': `${SITE_URL}/#org` },
          'publisher': { '@id': `${SITE_URL}/#org` },
          ...(release.body
            ? { 'description': release.body.slice(0, 280).replace(/\s+/g, ' ').trim() }
            : {}),
        })),
      },
      {
        '@type': 'BreadcrumbList',
        '@id': `${SITE_URL}/news#breadcrumb`,
        'itemListElement': [
          {
            '@type': 'ListItem',
            'position': 1,
            'name': 'Home',
            'item': SITE_URL,
          },
          {
            '@type': 'ListItem',
            'position': 2,
            'name': 'News & Releases',
            'item': `${SITE_URL}/news`,
          },
        ],
      },
    ],
  }))

  useHead(computed(() => ({
    script: [
      {
        type: 'application/ld+json',
        innerHTML: JSON.stringify(data.value),
      },
    ],
  })))
}

// -----------------------------------------------------------------------------
// Backward-compatible alias for the existing index.vue caller.
// -----------------------------------------------------------------------------

export const useStructuredData = useHomeStructuredData
