<script setup lang="ts">
import { PROVIDERS } from '~/lib/providers'
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

      <div class="mx-auto mt-12 grid max-w-5xl grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
        <div
          v-for="provider in PROVIDERS"
          :key="provider.id"
          class="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5 text-sm font-medium transition-all hover:border-primary/30 hover:shadow-sm"
        >
          <div
            class="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded"
            :style="{ backgroundColor: provider.color + '20' }"
          >
            <svg
              :viewBox="provider.svgViewBox || '0 0 24 24'"
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
        </div>
      </div>

      <p class="mt-8 text-center text-sm text-muted-foreground">
        … and any other S3-compatible service via custom endpoint.
      </p>
    </div>
  </section>
</template>
