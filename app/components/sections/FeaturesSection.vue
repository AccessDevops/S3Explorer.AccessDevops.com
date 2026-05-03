<script setup lang="ts">
import {
  PhPlugs,
  PhTreeView,
  PhPencilSimpleLine,
  PhRocketLaunch,
  PhMagicWand,
  PhMonitor,
} from '@phosphor-icons/vue'
import { Card, CardContent } from '~/components/ui/card'

const features = [
  {
    icon: PhPlugs,
    title: 'Connectivity',
    description: 'All S3-compatible providers — AWS, GCS, MinIO, Backblaze, R2, and more',
    items: [
      '25+ provider presets with auto-config',
      'Custom endpoints and regions',
      'Session tokens and temporary credentials',
      'Path-style and virtual-host addressing',
      'TLS by default, plain HTTP for local dev',
      'Encrypted local storage of credentials',
    ],
  },
  {
    icon: PhTreeView,
    title: 'Browsing',
    description: 'Navigate millions of objects without breaking a sweat',
    items: [
      'Local indexing for full-text search',
      'Incremental indexing on demand',
      '100× faster than flat listings on huge buckets',
      'Clickable breadcrumb',
      'Sort by name, size, or date',
      'Pagination via continuation tokens',
    ],
  },
  {
    icon: PhPencilSimpleLine,
    title: 'Editing',
    description: 'Read, edit, and inspect right inside the app',
    items: [
      'Built-in code editor for text files',
      'Image editor for previews and crops',
      'Auto-detect text vs binary (UTF-8)',
      'Content-Type customization',
      'Versioning, tags, and headers management',
      'ACL viewer and bucket configuration',
    ],
  },
  {
    icon: PhRocketLaunch,
    title: 'Performance',
    description: 'Built for speed on tiny buckets and gigabyte uploads alike',
    items: [
      'Parallel uploads (up to 30 concurrent)',
      'Multipart upload for files over 50 MB',
      'Smart prefix-level caching',
      '6 tunable performance settings',
      'Bucket statistics with TTL cache',
      'Retry with exponential backoff',
    ],
  },
  {
    icon: PhMagicWand,
    title: 'UX & Productivity',
    description: 'Keyboard-friendly, drag-and-drop, polished',
    items: [
      'Drag & drop from filesystem',
      'Paste from clipboard (text or files)',
      'Keyboard shortcuts for everything',
      'Copy path, key, or presigned URL',
      'Duplicate, rename, move (copy + delete)',
      'Metrics dashboard for usage and S3 impact',
    ],
  },
  {
    icon: PhMonitor,
    title: 'Cross-platform',
    description: 'Native binaries for every desktop',
    items: [
      'macOS Universal (Intel + Apple Silicon)',
      'Windows x64 and ARM64 (Surface, Snapdragon)',
      'Linux x86_64 and aarch64 (deb / AppImage / rpm)',
      'Auto-update with Ed25519 signature',
      'Dark mode and compact view',
      '10 languages out of the box',
    ],
  },
]
</script>

<template>
  <section class="border-b border-border/50 bg-muted/30 section-padding">
    <div class="container">
      <div class="mx-auto max-w-3xl text-center">
        <h2 class="text-3xl font-bold tracking-tight sm:text-4xl">
          Everything you need and even more
        </h2>
        <p class="mt-3 text-lg text-muted-foreground">
          A focused desktop tool that handles the boring parts of S3 so you can move fast.
        </p>
      </div>

      <div class="mx-auto mt-16 grid max-w-6xl gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card
          v-for="feature in features"
          :key="feature.title"
          class="group transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-md"
        >
          <CardContent class="p-6 pt-6">
            <div class="mb-4 inline-flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <component :is="feature.icon" :size="20" weight="duotone" />
            </div>
            <h3 class="text-lg font-semibold">{{ feature.title }}</h3>
            <p class="mt-1 text-sm text-muted-foreground">{{ feature.description }}</p>
            <ul class="mt-4 space-y-2 text-sm">
              <li v-for="item in feature.items" :key="item" class="flex items-start gap-2">
                <span class="mt-1.5 h-1 w-1 flex-shrink-0 rounded-full bg-primary" />
                <span class="text-muted-foreground">{{ item }}</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  </section>
</template>
