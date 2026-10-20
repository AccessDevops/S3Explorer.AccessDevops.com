<script setup lang="ts">
import { PhDownloadSimple, PhCircleNotch } from '@phosphor-icons/vue'
import { Button } from '~/components/ui/button'

interface Props {
  primary: { label: string, url: string, filename: string } | null
  loading: boolean
  releasesPageUrl: string
  size?: 'lg' | 'xl'
  fullWidth?: boolean
  version?: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 'xl',
  fullWidth: false,
  version: '',
})

const emit = defineEmits<{
  download: [url: string, filename: string]
  // The fallback button below replaces the real download whenever the release
  // feed is unreachable. It sends people to GitHub, where whatever they do
  // next is invisible to us — so at least record that we sent them.
  openReleases: [where: string]
}>()

function onClick() {
  if (props.primary) {
    emit('download', props.primary.url, props.primary.filename)
  }
}
</script>

<template>
  <Button
    v-if="loading"
    :size="size"
    variant="default"
    disabled
    :class="fullWidth ? 'w-full' : ''"
  >
    <PhCircleNotch :size="20" class="animate-spin" />
    Loading…
  </Button>
  <Button
    v-else-if="primary"
    :size="size"
    variant="default"
    :class="fullWidth ? 'w-full' : ''"
    @click="onClick"
  >
    <PhDownloadSimple :size="20" weight="bold" />
    <span class="flex flex-col items-center text-center leading-tight">
      <span>{{ primary.label }}</span>
      <span v-if="version" class="text-[11px] font-normal opacity-75">
        Latest release: {{ version }}
      </span>
    </span>
  </Button>
  <Button
    v-else
    as-child
    :size="size"
    variant="default"
    :class="fullWidth ? 'w-full' : ''"
  >
    <a
      :href="releasesPageUrl"
      target="_blank"
      rel="noopener noreferrer"
      @click="emit('openReleases', 'download_cta_fallback')"
    >
      <PhDownloadSimple :size="20" weight="bold" />
      Download from GitHub
    </a>
  </Button>
</template>
