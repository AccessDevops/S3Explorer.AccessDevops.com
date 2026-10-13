<script setup lang="ts">
import { PhArrowLeft, PhArrowSquareOut, PhDownloadSimple, PhWarning } from '@phosphor-icons/vue'
import { PROVIDERS } from '~/lib/providers'
import { getProviderDetail } from '~/lib/provider-details'
import { getProviderContent, DOCUMENTED_PROVIDER_IDS } from '~/lib/provider-content'
import { SITE } from '~/lib/constants'

const route = useRoute()
const id = computed(() => String(route.params.id))

const detail = computed(() => getProviderDetail(id.value))
const content = computed(() => getProviderContent(id.value))
const brand = computed(() => PROVIDERS.find(p => p.id === id.value))

// A provider without editorial content has no page — see provider-content.ts.
if (!DOCUMENTED_PROVIDER_IDS.includes(id.value) || !detail.value || !content.value) {
  throw createError({ statusCode: 404, statusMessage: 'Provider not documented', fatal: true })
}

const d = detail.value!
const c = content.value!
const pageUrl = `${SITE.domain}/providers/${id.value}/`
const title = `${d.name} with S3 Explorer — connection settings and examples`

useSeoMeta({
  title,
  description: c.summary,
  ogTitle: title,
  ogDescription: c.summary,
  ogUrl: pageUrl,
  ogImage: `${SITE.domain}/og-image.png`,
  twitterImage: `${SITE.domain}/og-image.png`,
})

// TechArticle rather than Article: this is reference documentation, and the
// type carries `proficiencyLevel` and `dependencies`, which is what a search
// engine needs to tell it apart from a blog post.
useHead({
  script: [{
    key: 'structured-data',
    type: 'application/ld+json',
    innerHTML: JSON.stringify({
      '@context': 'https://schema.org',
      '@graph': [
        {
          '@type': 'TechArticle',
          '@id': `${pageUrl}#article`,
          'headline': title,
          'description': c.summary,
          'proficiencyLevel': 'Beginner',
          'dependencies': `${d.name}, S3 Explorer`,
          'url': pageUrl,
          'about': { '@type': 'SoftwareApplication', 'name': 'S3 Explorer' },
          'publisher': { '@id': `${SITE.domain}/#org` },
        },
        {
          '@type': 'BreadcrumbList',
          'itemListElement': [
            { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': `${SITE.domain}/` },
            { '@type': 'ListItem', 'position': 2, 'name': 'Providers', 'item': `${SITE.domain}/providers/` },
            { '@type': 'ListItem', 'position': 3, 'name': d.name, 'item': pageUrl },
          ],
        },
      ],
    }),
  }],
})

const facts = computed(() => [
  { label: 'Endpoint', value: d.endpointTemplate ?? 'Not required — derived from the region' },
  { label: 'Default region', value: d.defaultRegion ?? '—' },
  {
    label: 'Addressing',
    value: `${d.pathStyle ? 'Path-style' : 'Virtual-hosted'}${d.pathStyleLocked ? ' (enforced)' : ''}`,
  },
  { label: 'Temporary credentials', value: d.sessionTokenRelevant ? 'Supported (STS / AssumeRole)' : 'Not applicable' },
])

const exampleRows = computed(() => [
  ...(c.example.endpoint ? [{ k: 'Endpoint', v: c.example.endpoint }] : []),
  ...(c.example.region ? [{ k: 'Region', v: c.example.region }] : []),
  { k: 'Access key', v: c.example.accessKey },
  { k: 'Secret key', v: c.example.secretKey },
  { k: 'Addressing', v: c.example.addressing },
])
</script>

<template>
  <div class="container section-padding">
    <div class="mx-auto max-w-3xl">
      <NuxtLink
        to="/providers/"
        class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
      >
        <PhArrowLeft :size="15" />
        All providers
      </NuxtLink>

      <div class="mt-6 flex items-center gap-3">
        <div
          v-if="brand"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
          :style="{ backgroundColor: brand.color + '20' }"
        >
          <svg :viewBox="brand.svgViewBox || '0 0 24 24'" class="h-6 w-6" xmlns="http://www.w3.org/2000/svg">
            <path :d="brand.svgPath" :fill="brand.color" :stroke="brand.color" stroke-width="0.5" />
          </svg>
        </div>
        <h1 class="text-3xl font-bold tracking-tight sm:text-4xl">
          {{ d.name }}
        </h1>
      </div>

      <p class="mt-5 text-lg leading-relaxed text-muted-foreground">
        {{ c.intro }}
      </p>

      <!-- Connection facts -->
      <h2 class="mt-12 text-xl font-semibold tracking-tight">
        Connection settings
      </h2>
      <dl class="mt-4 divide-y divide-border rounded-xl border border-border bg-card">
        <div v-for="f in facts" :key="f.label" class="flex flex-col gap-1 p-4 sm:flex-row sm:gap-4">
          <dt class="w-48 flex-shrink-0 text-sm font-medium text-muted-foreground">
            {{ f.label }}
          </dt>
          <dd class="break-all font-mono text-sm">
            {{ f.value }}
          </dd>
        </div>
      </dl>

      <!-- Worked example -->
      <h2 class="mt-12 text-xl font-semibold tracking-tight">
        A filled-in example
      </h2>
      <p class="mt-2 text-sm text-muted-foreground">
        Every value below is fabricated — they are shaped like real
        {{ d.name }} credentials so you can recognise yours, and they
        authenticate nothing.
      </p>
      <dl class="mt-4 divide-y divide-border rounded-xl border border-border bg-muted/30">
        <div v-for="row in exampleRows" :key="row.k" class="flex flex-col gap-1 p-4 sm:flex-row sm:gap-4">
          <dt class="w-48 flex-shrink-0 text-sm font-medium text-muted-foreground">
            {{ row.k }}
          </dt>
          <dd class="break-all font-mono text-sm">
            {{ row.v }}
          </dd>
        </div>
      </dl>
      <p v-if="c.example.note" class="mt-3 text-sm leading-relaxed text-muted-foreground">
        {{ c.example.note }}
      </p>

      <!-- Help copy carried over from the app's connection form -->
      <h2 class="mt-12 text-xl font-semibold tracking-tight">
        Where each value comes from
      </h2>
      <div class="mt-4 space-y-4">
        <div v-if="d.help.endpoint">
          <h3 class="text-sm font-semibold">
            Endpoint
          </h3>
          <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
            {{ d.help.endpoint }}
          </p>
        </div>
        <div v-if="d.help.credentials">
          <h3 class="text-sm font-semibold">
            Credentials
          </h3>
          <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
            {{ d.help.credentials }}
          </p>
        </div>
        <div v-if="d.help.tips">
          <h3 class="text-sm font-semibold">
            Notes
          </h3>
          <p class="mt-1 text-sm leading-relaxed text-muted-foreground">
            {{ d.help.tips }}
          </p>
        </div>
      </div>

      <!-- Gotchas -->
      <h2 class="mt-12 text-xl font-semibold tracking-tight">
        What usually goes wrong
      </h2>
      <div class="mt-4 space-y-3">
        <div
          v-for="g in c.gotchas"
          :key="g.title"
          class="rounded-xl border border-border bg-card p-5"
        >
          <h3 class="flex items-start gap-2 font-medium">
            <PhWarning :size="17" weight="fill" class="mt-0.5 flex-shrink-0 text-yellow-500" />
            {{ g.title }}
          </h3>
          <p class="mt-2 text-sm leading-relaxed text-muted-foreground">
            {{ g.body }}
          </p>
        </div>
      </div>

      <!-- Regions -->
      <template v-if="d.regions.length">
        <h2 class="mt-12 text-xl font-semibold tracking-tight">
          Regions available in the app
        </h2>
        <div class="mt-4 flex flex-wrap gap-1.5">
          <code
            v-for="r in d.regions"
            :key="r"
            class="rounded border border-border bg-muted/50 px-2 py-1 font-mono text-xs"
          >{{ r }}</code>
        </div>
      </template>

      <!-- Outbound + CTA -->
      <div class="mt-12 flex flex-col gap-3 border-t border-border pt-8 sm:flex-row sm:items-center sm:justify-between">
        <a
          :href="d.docsUrl"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          {{ d.name }} documentation
          <PhArrowSquareOut :size="15" />
        </a>
        <NuxtLink
          to="/"
          class="inline-flex items-center justify-center gap-2 rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
        >
          <PhDownloadSimple :size="17" />
          Download S3 Explorer
        </NuxtLink>
      </div>
    </div>
  </div>
</template>
