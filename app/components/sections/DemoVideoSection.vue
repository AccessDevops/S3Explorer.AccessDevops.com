<script setup lang="ts">
const emit = defineEmits<{
  engaged: []
}>()

const videoEl = ref<HTMLVideoElement | null>(null)
const hasEngaged = ref(false)

function onVolumeChange() {
  if (hasEngaged.value) return
  const v = videoEl.value
  if (v && !v.muted && v.volume > 0) {
    hasEngaged.value = true
    emit('engaged')
  }
}
</script>

<template>
  <section class="border-b border-border/50 pb-14 md:pb-20 lg:pb-24">
    <div class="container">
      <div class="relative mx-auto max-w-5xl">
        <div class="absolute -inset-4 -z-10 rounded-3xl bg-gradient-to-br from-primary/20 via-primary/5 to-transparent blur-2xl" />
        <div class="overflow-hidden rounded-xl border border-border bg-card shadow-2xl">
          <video
            ref="videoEl"
            autoplay
            muted
            loop
            playsinline
            controls
            preload="auto"
            class="aspect-[2044/1334] w-full"
            @volumechange="onVolumeChange"
          >
            <source src="/demo.mp4" type="video/mp4">
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  </section>
</template>
