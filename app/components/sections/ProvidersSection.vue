<script setup lang="ts">
import { PROVIDERS } from '~/lib/providers'
import { DOCUMENTED_PROVIDER_IDS } from '~/lib/provider-content'

// Providers we have written a guide for become links; the rest stay plain
// tiles. Deliberately no visual distinction beyond the cursor: the grid is
// a reassurance element for humans, and turning it into a navigation menu
// would work against the point of keeping the page minimal. Its job here is
// to give crawlers a path to the guides from the home page.
//
// resolveComponent has to run during setup, not inside a helper called later
// from the render function — otherwise Vue warns and returns the raw string.
const NuxtLinkComponent = resolveComponent('NuxtLink')

function isDocumented(id: string) {
  return DOCUMENTED_PROVIDER_IDS.includes(id)
}
function tileTag(id: string) {
  return isDocumented(id) ? NuxtLinkComponent : 'div'
}
function tileProps(id: string) {
  return isDocumented(id) ? { to: `/providers/${id}/` } : {}
}
</script>

<template>
  <section class="border-b border-border/50 section-padding">
    <div class="container">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Compatible with every S3 provider
        </h2>
        <p class="mt-3 text-lg text-muted-foreground">
          One app for AWS S3, every cloud-native S3 service, and your self-hosted setups.
        </p>
      </div>

      <!-- Flex rather than grid: with 24 tiles the last row is always a
           partial one, and CSS Grid leaves it flush left with a hole on the
           right. Wrapping flex items with justify-center centres that orphan
           row. The basis values reproduce the previous column counts exactly
           — (100% - gaps) / columns, with gap-2 being 8px. -->
      <div class="mx-auto mt-12 flex max-w-5xl flex-wrap justify-center gap-2">
        <component
          :is="tileTag(provider.id)"
          v-for="provider in PROVIDERS"
          :key="provider.id"
          v-bind="tileProps(provider.id)"
          class="flex min-w-0 basis-[calc(50%-4px)] items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium transition-all hover:border-primary/30 hover:shadow-sm sm:basis-[calc(33.333%-5.333px)] md:basis-[calc(25%-6px)] lg:basis-[calc(20%-6.4px)]"
        >
          <div
            class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded"
            :style="{ backgroundColor: provider.color + '20' }"
          >
            <svg
              :viewBox="provider.svgViewBox || '0 0 24 24'"
              role="img"
              :aria-label="`${provider.name} logo`"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              class="h-[17px] w-[17px]"
            >
              <path
                :d="provider.svgPath"
                :fill="provider.color"
                :stroke="provider.color"
                stroke-width="0.5"
              />
            </svg>
          </div>
          <span class="truncate">{{ provider.name }}</span>
        </component>
      </div>

      <p class="mt-8 text-center text-sm text-muted-foreground">
        … and any other S3-compatible service via custom endpoint.
      </p>
    </div>
  </section>
</template>
