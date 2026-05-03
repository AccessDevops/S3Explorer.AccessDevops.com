<script setup lang="ts">
import { PhArrowRight } from '@phosphor-icons/vue'
import { Button } from '~/components/ui/button'

interface Props {
  primary: { label: string, url: string, filename: string } | null
  loading: boolean
  releasesPageUrl: string
}

defineProps<Props>()

const emit = defineEmits<{
  download: [url: string, filename: string]
}>()
</script>

<template>
  <section class="bg-muted/30 section-padding">
    <div class="container">
      <div class="relative mx-auto max-w-4xl overflow-hidden rounded-2xl border border-border bg-gradient-to-br from-primary/5 via-background to-background p-10 text-center md:p-16">
        <div class="absolute -top-32 left-1/2 -z-10 h-64 w-[120%] -translate-x-1/2 rounded-full bg-primary/10 blur-3xl" />

        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Ready to take control of your S3 storage?
        </h2>
        <p class="mx-auto mt-3 max-w-xl text-lg text-muted-foreground">
          Free download, no signup, works offline. Buy a license whenever you want to support development.
        </p>

        <div class="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <DownloadCta
            :primary="primary"
            :loading="loading"
            :releases-page-url="releasesPageUrl"
            size="lg"
            @download="(u, f) => emit('download', u, f)"
          />
          <Button as-child variant="outline" size="lg">
            <NuxtLink to="/buy">
              Get a license
              <PhArrowRight :size="16" />
            </NuxtLink>
          </Button>
        </div>
      </div>
    </div>
  </section>
</template>
