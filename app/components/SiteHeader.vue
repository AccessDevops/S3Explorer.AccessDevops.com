<script setup lang="ts">
import { PhGithubLogo, PhMoon, PhSun, PhList, PhX, PhSparkle, PhBug } from '@phosphor-icons/vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import { REPO, REPORT_ISSUE_URL } from '~/lib/constants'

const { isDark, toggle } = useDarkMode()
const mobileOpen = ref(false)
const route = useRoute()

watch(() => route.path, () => {
  mobileOpen.value = false
})

const nav = [
  { label: 'Home', to: '/', exact: true },
  { label: 'Buy', to: '/buy', exact: false },
  { label: 'News', to: '/news', exact: false },
]
</script>

<template>
  <header class="sticky top-0 z-40 w-full border-b border-border/50 bg-background/80 backdrop-blur-md">
    <div class="container relative flex h-16 items-center gap-6">
      <!-- LEFT: logo + nav -->
      <NuxtLink to="/" class="flex items-center gap-2 font-semibold">
        <img src="/icon-128.png" alt="" class="h-8 w-8" />
        <span class="hidden sm:inline">S3 Explorer</span>
      </NuxtLink>

      <nav class="hidden md:flex items-center gap-1">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :exact-active-class="item.exact ? '!text-foreground' : ''"
          :active-class="item.exact ? '' : '!text-foreground'"
          class="px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {{ item.label }}
        </NuxtLink>
      </nav>

      <!-- CENTER: badge — viewport-centered via absolute, lg+ only -->
      <Badge
        variant="outline"
        class="pointer-events-none absolute left-1/2 hidden -translate-x-1/2 gap-1.5 px-3 py-1 font-normal lg:inline-flex"
      >
        <PhSparkle :size="12" weight="fill" class="text-primary" />
        <span class="text-xs text-muted-foreground">Free usage, license to support development</span>
      </Badge>

      <!-- RIGHT: report issue + theme + github + mobile burger -->
      <div class="ml-auto flex items-center gap-2">
        <a
          :href="REPORT_ISSUE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="hidden md:inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 px-3 text-xs font-medium text-primary transition-colors hover:border-primary/50 hover:bg-primary/10"
        >
          <PhBug :size="14" weight="bold" />
          <span>Report issue</span>
        </a>

        <Button variant="ghost" size="icon-sm" :aria-label="isDark ? 'Switch to light mode' : 'Switch to dark mode'" @click="toggle">
          <PhSun v-if="isDark" :size="18" />
          <PhMoon v-else :size="18" />
        </Button>
        <Button variant="ghost" size="icon-sm" as-child aria-label="GitHub repository">
          <a :href="REPO.url" target="_blank" rel="noopener noreferrer">
            <PhGithubLogo :size="18" />
          </a>
        </Button>
        <Button variant="ghost" size="icon-sm" class="md:hidden" :aria-label="mobileOpen ? 'Close menu' : 'Open menu'" @click="mobileOpen = !mobileOpen">
          <PhX v-if="mobileOpen" :size="18" />
          <PhList v-else :size="18" />
        </Button>
      </div>
    </div>

    <div v-if="mobileOpen" class="md:hidden border-t border-border/50 bg-background">
      <nav class="container flex flex-col py-2">
        <NuxtLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          :exact-active-class="item.exact ? '!text-foreground' : ''"
          :active-class="item.exact ? '' : '!text-foreground'"
          class="px-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {{ item.label }}
        </NuxtLink>
        <a
          :href="REPORT_ISSUE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center gap-1.5 px-2 py-3 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <PhBug :size="14" />
          <span>Report issue</span>
        </a>
      </nav>
    </div>
  </header>
</template>
