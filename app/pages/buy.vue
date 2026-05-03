<script setup lang="ts">
import {
  PhCheck,
  PhArrowRight,
  PhDownloadSimple,
  PhEnvelope,
  PhKey,
} from '@phosphor-icons/vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { Card, CardContent } from '~/components/ui/card'
import { LEMON_SQUEEZY, SITE, buildCheckoutUrl } from '~/lib/constants'
import { readPersistedReferralId } from '~/composables/useDownloadTracking'
import { useBuyStructuredData } from '~/composables/useStructuredData'

const SITE_BASE_URL = SITE.domain

const { trackPageView, trackBuyCtaClicked } = useDownloadTracking()

useSeoMeta({
  title: 'Get a License — S3 Explorer',
  description: 'Support S3 Explorer development and unlock unlimited connection profiles. $11.50 lifetime or $1.99 per month. The app remains free without a license.',
  ogTitle: 'Get a License — S3 Explorer',
  ogDescription: 'Support S3 Explorer development. $11.50 lifetime or $1.99/month. The app stays free.',
  ogUrl: 'https://s3explorer.accessdevops.com/buy',
  ogImage: 'https://s3explorer.accessdevops.com/og-image-buy.png',
  twitterImage: 'https://s3explorer.accessdevops.com/og-image-buy.png',
})

// Source attribution: distinguishes organic visits from desktop nag popup redirects
// (the desktop app sends users to /buy?source=desktop_nag).
//
// `/buy` is prerendered, so `useRoute().query` is empty during the first hydration
// tick — reading it in onMounted would tag `website_visited` as `organic` even when
// the URL says `?source=desktop_nag`. We seed from `window.location.search` instead,
// the only reliable source on a prerendered page.
const ALLOWED_SOURCES = ['desktop_nag', 'desktop_settings', 'email', 'social']

function normalizeSource(raw: string | null | undefined): string {
  if (typeof raw !== 'string' || raw.length === 0) return 'organic'
  if (ALLOWED_SOURCES.includes(raw)) return raw
  return raw.slice(0, 32)
}

const trafficSource = ref<string>('organic')

// Referral ID persisted at download_clicked on the home page. We pipe it through
// to Lemon Squeezy via custom_data so the order webhook can identify the same
// person in PostHog (web session ↔ checkout ↔ first app launch).
const referralId = ref<string | null>(null)

onMounted(() => {
  const params = new URLSearchParams(window.location.search)
  trafficSource.value = normalizeSource(params.get('source'))
  referralId.value = readPersistedReferralId()
  trackPageView('buy', { source: trafficSource.value })
})

function trackCta(tier: 'monthly' | 'lifetime' | 'free') {
  trackBuyCtaClicked(tier, {
    source: trafficSource.value,
    referral_id: referralId.value,
  })
}

// Lemon Squeezy URLs with checkout custom_data — referral_id and source
// flow into the order webhook payload (meta.custom_data) for end-to-end stitching.
const monthlyCheckoutUrl = computed(() =>
  buildCheckoutUrl(LEMON_SQUEEZY.checkoutMonthly, {
    referral_id: referralId.value,
    source: trafficSource.value,
  })
)
const lifetimeCheckoutUrl = computed(() =>
  buildCheckoutUrl(LEMON_SQUEEZY.checkoutLifetime, {
    referral_id: referralId.value,
    source: trafficSource.value,
  })
)

const tiers = computed(() => [
  {
    key: 'free' as const,
    name: 'Free',
    price: '$0',
    cadence: 'Forever',
    description: 'Full app, ready to use. Forever.',
    features: [
      { text: 'All features unlocked', included: true },
      { text: 'Up to 5 connection profiles', included: true },
      { text: 'All providers and endpoints', included: true },
      { text: 'Auto-updates', included: true },
      { text: 'Occasional reminder popup', included: true, neutral: true },
      { text: 'Unlimited connection profiles', included: false },
    ],
    cta: { label: 'Download for free', href: '/', external: false },
    highlight: false,
  },
  {
    key: 'monthly' as const,
    name: 'Monthly',
    price: '$1.99',
    cadence: 'Per month, cancel anytime',
    description: 'Subscribe to support continuous development.',
    features: [
      { text: 'Unlimited connection profiles', included: true },
      { text: 'No reminder popup', included: true },
      { text: 'Up to 3 active devices', included: true },
      { text: '5-day free trial', included: true },
      { text: 'Cancel anytime', included: true },
    ],
    cta: { label: 'Start 5-day free trial', href: monthlyCheckoutUrl.value, external: true },
    highlight: false,
  },
  {
    key: 'lifetime' as const,
    name: 'Lifetime',
    price: '$11.50',
    cadence: 'One-time payment',
    description: 'Pay once, use forever. The simplest way to support.',
    features: [
      { text: 'Unlimited connection profiles', included: true },
      { text: 'No reminder popup', included: true },
      { text: 'Up to 5 active devices', included: true },
      { text: 'Lifetime updates', included: true },
      { text: 'Pay once, no subscription', included: true },
    ],
    cta: { label: 'Buy lifetime license', href: lifetimeCheckoutUrl.value, external: true },
    highlight: true,
    badge: 'Best value',
  },
])

const steps = [
  {
    icon: PhDownloadSimple,
    title: 'Pay & download',
    description: 'Complete your purchase securely on Lemon Squeezy. The app itself is already free to download.',
  },
  {
    icon: PhEnvelope,
    title: 'Receive your license key',
    description: 'You get an email with your license key right after payment, usually within seconds.',
  },
  {
    icon: PhKey,
    title: 'Activate inside the app',
    description: 'Open Settings → License, paste your key, and click Activate. The reminder disappears immediately and the profile limit is lifted.',
  },
]

const faqs = [
  {
    q: 'Is there a refund policy?',
    a: 'Yes — Lemon Squeezy offers a 14-day money-back guarantee on every purchase. Email us if you have any issue and we\'ll process the refund.',
  },
  {
    q: 'How does the device activation limit work?',
    a: 'Each license can be active on up to 3 devices (Monthly) or 5 devices (Lifetime) at the same time. The limit counts simultaneously active devices, not lifetime activations — so if you switch laptops, open Settings → License on the old machine, click Deactivate, then activate the license on the new one. You can move between machines as often as you need.',
  },
  {
    q: 'What happens if I cancel my Monthly subscription?',
    a: 'Your license stays active until the end of the current billing cycle, then it expires. Once expired, the app reverts to the Free tier (5 connection profiles, occasional reminder popup). The app itself keeps working — only the license benefits stop. You can resubscribe anytime, or buy a Lifetime license to keep the benefits permanently.',
  },
  {
    q: 'What happens if I do not buy a license?',
    a: 'Nothing breaks. The app stays fully functional with up to 5 connection profiles, and you\'ll see an occasional, dismissible reminder popup. The license is purely there to support development and remove that popup.',
  },
  {
    q: 'Do I need an account to buy?',
    a: 'No. Lemon Squeezy handles checkout — you just need a working email to receive the license key.',
  },
  {
    q: 'Monthly vs lifetime: which one should I pick?',
    a: 'At $11.50, the lifetime license is essentially a tip with permanent benefits. The monthly option exists for people who prefer subscriptions or want to test the waters first.',
  },
  {
    q: 'Will the price increase later?',
    a: 'It might, as the app grows. Lifetime licenses purchased now will keep working at the price you paid.',
  },
]

// JSON-LD structured data: Product (offers), FAQPage, BreadcrumbList — combined
// in an @graph for richer Google search results (FAQ rich snippets, breadcrumb).
useBuyStructuredData({
  tiers: [
    {
      name: 'Free',
      price: '0',
      cadence: 'forever',
      description: 'All features, up to 5 connection profiles',
      url: SITE_BASE_URL,
    },
    {
      name: 'Monthly Subscription',
      price: '1.99',
      cadence: 'per month, 5-day free trial',
      description: 'Unlimited profiles, no reminder popup, up to 3 active devices',
      url: LEMON_SQUEEZY.checkoutMonthly,
    },
    {
      name: 'Lifetime License',
      price: '11.50',
      cadence: 'one-time payment',
      description: 'Unlimited profiles, no reminder popup, up to 5 active devices, lifetime updates',
      url: LEMON_SQUEEZY.checkoutLifetime,
    },
  ],
  faqs,
})

const openFaqIndex = ref<number | null>(0)

function toggleFaq(idx: number) {
  openFaqIndex.value = openFaqIndex.value === idx ? null : idx
}
</script>

<template>
  <div>
    <!-- Combined hero + pricing (single viewport, no scroll) -->
    <section class="border-b border-border/50 bg-muted/20 py-10 md:py-14 lg:py-16">
      <div class="container">
        <div class="mx-auto max-w-3xl text-center">
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            Get a License
          </h1>
          <p class="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
            S3 Explorer is free for everyone. License purchases unlock unlimited connection profiles, remove
            the reminder popup, and directly fund continued development.
          </p>
        </div>

        <div class="mx-auto mt-10 grid max-w-6xl gap-5 md:grid-cols-3">
          <Card
            v-for="tier in tiers"
            :key="tier.key"
            :class="[
              'relative flex flex-col',
              tier.highlight ? 'border-primary shadow-lg ring-1 ring-primary/30' : '',
            ]"
          >
            <Badge
              v-if="tier.highlight && tier.badge"
              class="absolute -top-3 left-1/2 -translate-x-1/2"
            >
              {{ tier.badge }}
            </Badge>
            <CardContent class="flex flex-1 flex-col p-6">
              <h2 class="text-lg font-semibold">{{ tier.name }}</h2>
              <p class="mt-1 text-sm text-muted-foreground">{{ tier.description }}</p>
              <div class="mt-5 flex items-baseline gap-1">
                <span class="text-4xl font-bold tracking-tight">{{ tier.price }}</span>
              </div>
              <p class="text-sm text-muted-foreground">{{ tier.cadence }}</p>

              <ul class="mt-6 flex-1 space-y-2.5">
                <li v-for="feature in tier.features" :key="feature.text" class="flex items-start gap-2 text-sm">
                  <PhCheck
                    v-if="feature.included && !feature.neutral"
                    :size="18"
                    weight="bold"
                    class="mt-0.5 flex-shrink-0 text-primary"
                  />
                  <span
                    v-else
                    class="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full"
                    :class="feature.included ? 'bg-muted-foreground' : 'bg-border'"
                  />
                  <span :class="feature.included ? '' : 'text-muted-foreground line-through'">
                    {{ feature.text }}
                  </span>
                </li>
              </ul>

              <Button
                as-child
                :variant="tier.highlight ? 'default' : 'outline'"
                size="lg"
                class="mt-6 w-full"
              >
                <NuxtLink
                  v-if="!tier.cta.external"
                  :to="tier.cta.href"
                  @click="trackCta(tier.key)"
                >
                  {{ tier.cta.label }}
                  <PhArrowRight :size="16" />
                </NuxtLink>
                <a
                  v-else
                  :href="tier.cta.href"
                  target="_blank"
                  rel="noopener noreferrer"
                  @click="trackCta(tier.key)"
                >
                  {{ tier.cta.label }}
                  <PhArrowRight :size="16" />
                </a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>

    <!-- How it works -->
    <section class="border-y border-border/50 bg-muted/20 section-padding">
      <div class="container">
        <div class="mx-auto max-w-3xl text-center">
          <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
            How licenses work
          </h2>
          <p class="mt-3 text-lg text-muted-foreground">
            Three steps. No accounts to create.
          </p>
        </div>

        <div class="mx-auto mt-12 grid max-w-5xl gap-6 md:grid-cols-3">
          <div v-for="(step, idx) in steps" :key="step.title" class="relative">
            <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <component :is="step.icon" :size="20" weight="duotone" />
            </div>
            <div class="absolute right-0 top-3 text-xs font-mono text-muted-foreground/60">
              {{ String(idx + 1).padStart(2, '0') }}
            </div>
            <h3 class="text-lg font-semibold">{{ step.title }}</h3>
            <p class="mt-1 text-sm text-muted-foreground">{{ step.description }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- FAQ -->
    <section class="section-padding">
      <div class="container">
        <div class="mx-auto max-w-3xl">
          <h2 class="text-center text-3xl font-bold tracking-tight sm:text-4xl">
            Frequently asked questions
          </h2>
          <div class="mt-12 divide-y divide-border rounded-xl border border-border bg-card">
            <div v-for="(faq, idx) in faqs" :key="faq.q">
              <button
                class="flex w-full items-center justify-between px-6 py-5 text-left transition-colors hover:bg-accent/50"
                :aria-expanded="openFaqIndex === idx"
                @click="toggleFaq(idx)"
              >
                <span class="text-sm font-medium">{{ faq.q }}</span>
                <PhArrowRight
                  :size="16"
                  class="flex-shrink-0 text-muted-foreground transition-transform"
                  :class="openFaqIndex === idx ? 'rotate-90' : ''"
                />
              </button>
              <div v-if="openFaqIndex === idx" class="px-6 pb-5 text-sm text-muted-foreground">
                {{ faq.a }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>
