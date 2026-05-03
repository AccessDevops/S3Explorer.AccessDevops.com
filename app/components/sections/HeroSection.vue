<script setup lang="ts">
import type { DownloadOption } from '~/composables/useOsDetection'

interface Props {
  primary: { label: string, url: string, filename: string } | null
  loading: boolean
  releasesPageUrl: string
  version: string
  showAllPlatforms: boolean
  allDownloads: DownloadOption[]
}

const props = defineProps<Props>()

const emit = defineEmits<{
  download: [url: string, filename: string]
  toggleAllPlatforms: []
}>()

// Group pills by their `group` field (set by INSTALLERS spec). Map preserves
// insertion order, so we get the same order as in the INSTALLERS array:
// macOS → Windows x64 → Windows ARM64 → Linux x64 → Linux ARM64.
const groupedDownloads = computed(() => {
  const groups = new Map<string, DownloadOption[]>()
  for (const dl of props.allDownloads) {
    if (!groups.has(dl.group)) groups.set(dl.group, [])
    groups.get(dl.group)!.push(dl)
  }
  return Array.from(groups.entries())
})
</script>

<template>
  <section class="relative overflow-hidden">
    <!-- background grid (atténuée pour ne pas concurrencer le logo) -->
    <div class="absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,white_30%,transparent_70%)]">
      <div class="absolute inset-0 bg-[linear-gradient(to_right,hsl(var(--border))_1px,transparent_1px),linear-gradient(to_bottom,hsl(var(--border))_1px,transparent_1px)] bg-[size:24px_24px] opacity-30" />
    </div>

    <div class="container pb-6 pt-10 md:pb-8 md:pt-14 lg:pb-10 lg:pt-16">
      <div class="mx-auto max-w-3xl text-center">
        <!-- App icon -->
        <img
          src="/icon-256.png"
          alt=""
          class="mx-auto h-24 w-24 drop-shadow-lg md:h-28 md:w-28"
        />

        <h1 class="mt-6 text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl">
          <span class="gradient-text">S3 Explorer</span>
        </h1>

        <p class="mx-auto mt-4 max-w-2xl text-base text-muted-foreground sm:text-lg">
          The <strong class="font-semibold text-foreground">modern desktop app</strong> for <strong class="font-semibold text-foreground">S3-compatible storage</strong>. Browse, edit, and navigate millions of objects with a smart local index — across every S3-compatible provider.
        </p>

        <p class="mt-3 text-sm text-muted-foreground">
          for Windows, Linux &amp; macOS
        </p>

        <div class="mt-6 flex flex-col items-center gap-4">
          <DownloadCta
            :primary="primary"
            :loading="loading"
            :releases-page-url="releasesPageUrl"
            :version="version"
            size="xl"
            @download="(u, f) => emit('download', u, f)"
          />

          <button
            v-if="allDownloads.length > 1 || !primary"
            type="button"
            class="text-sm text-muted-foreground transition-colors hover:text-foreground"
            @click="emit('toggleAllPlatforms')"
          >
            {{ showAllPlatforms ? 'Hide other platforms ↑' : 'Other platforms ↓' }}
          </button>

          <Transition
            enter-active-class="transition-all duration-300 ease-out"
            enter-from-class="opacity-0 -translate-y-1"
            enter-to-class="opacity-100 translate-y-0"
            leave-active-class="transition-all duration-200 ease-in"
            leave-from-class="opacity-100 translate-y-0"
            leave-to-class="opacity-0 -translate-y-1"
          >
            <div
              v-if="showAllPlatforms"
              class="flex flex-col items-center gap-3"
            >
              <!--
                2-column grid: labels (right-aligned) on the left, pills
                (left-aligned) on the right. The whole grid sizes to content
                via w-fit and centers via mx-auto, giving a balanced
                "definition list" look around a virtual central axis.
              -->
              <div class="mx-auto grid w-fit max-w-full grid-cols-1 gap-x-4 gap-y-2 sm:grid-cols-[auto_auto]">
                <template v-for="[groupName, items] in groupedDownloads" :key="groupName">
                  <span class="self-center text-left text-xs font-medium text-muted-foreground sm:text-right">
                    {{ groupName }}
                  </span>
                  <div class="flex flex-wrap gap-1.5">
                    <a
                      v-for="dl in items"
                      :key="dl.id"
                      :href="dl.url"
                      :title="dl.description"
                      class="inline-flex items-center gap-1.5 rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                    >
                      <span>{{ dl.label }}</span>
                      <span class="font-mono text-[10px] opacity-70">{{ dl.version }}</span>
                    </a>
                  </div>
                </template>
              </div>
              <a
                :href="releasesPageUrl"
                target="_blank"
                rel="noopener noreferrer"
                class="rounded-md bg-muted px-2.5 py-1 text-xs text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              >
                Others ↗
              </a>
            </div>
          </Transition>
        </div>

      </div>
    </div>
  </section>
</template>
