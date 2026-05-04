<script setup lang="ts">
import { marked } from 'marked'
import { PhArrowSquareOut, PhCalendarBlank, PhCircleNotch } from '@phosphor-icons/vue'
import { Badge } from '~/components/ui/badge'
import { Card, CardContent } from '~/components/ui/card'
import { Button } from '~/components/ui/button'
import { REPO } from '~/lib/constants'
import { useNewsStructuredData } from '~/composables/useStructuredData'

const { releases, loading, error } = useNews()
const { trackPageView, trackNewsViewed } = useDownloadTracking()

// Inject Blog + BlogPosting[] + BreadcrumbList JSON-LD. Reactive — updates
// whenever the GitHub releases feed refreshes.
useNewsStructuredData(releases)

useSeoMeta({
  title: 'News & Releases — S3 Explorer',
  description: 'Latest releases, features, and improvements for S3 Explorer. Follow what\'s new in the desktop app.',
  ogTitle: 'News & Releases — S3 Explorer',
  ogDescription: 'Latest releases, features, and improvements for S3 Explorer.',
  ogUrl: 'https://s3explorer.accessdevops.com/news',
  ogImage: 'https://s3explorer.accessdevops.com/og-image-news.png',
  twitterImage: 'https://s3explorer.accessdevops.com/og-image-news.png',
})

onMounted(() => {
  // Two events on /news entry:
  //   - website_visited (page=news, source=…) — feeds the unified "traffic by
  //     page" + "traffic by source" tiles on the Overview dashboard.
  //   - news_page_viewed — kept for backward compat with existing insights.
  trackPageView('news')
  trackNewsViewed()
})

marked.setOptions({
  breaks: true,
  gfm: true,
})

function formatDate(iso: string): string {
  if (!iso) return ''
  try {
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    })
  } catch {
    return iso
  }
}

function renderMarkdown(body: string): string {
  if (!body) return ''
  return marked.parse(body) as string
}
</script>

<template>
  <div>
    <!-- Hero (compact) -->
    <section class="border-b border-border/50 bg-muted/20 pb-6 pt-8 md:pb-8 md:pt-10">
      <div class="container">
        <div class="mx-auto max-w-3xl text-center">
          <h1 class="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl">
            News & Releases
          </h1>
          <p class="mx-auto mt-3 max-w-2xl text-sm text-muted-foreground">
            Every published version, with full release notes. The desktop app reads from the same feed,
            so what you see here is exactly what users see in-app.
          </p>
        </div>
      </div>
    </section>

    <!-- Feed (badge moved here, tighter top padding) -->
    <section class="pb-20 pt-8 md:pb-28 md:pt-10">
      <div class="container">
        <div class="mx-auto max-w-3xl">
          <!-- Loading state -->
          <div v-if="loading" class="flex items-center justify-center py-20 text-muted-foreground">
            <PhCircleNotch :size="24" class="animate-spin" />
            <span class="ml-3 text-sm">Loading releases…</span>
          </div>

          <!-- Error state -->
          <div v-else-if="error" class="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center">
            <p class="text-sm font-medium">Couldn't load releases.</p>
            <p class="mt-1 text-sm text-muted-foreground">
              You can browse them directly on GitHub:
            </p>
            <Button as-child variant="outline" size="sm" class="mt-4">
              <a :href="REPO.releasesUrl" target="_blank" rel="noopener noreferrer">
                View on GitHub
                <PhArrowSquareOut :size="14" />
              </a>
            </Button>
          </div>

          <!-- Empty state -->
          <div v-else-if="releases.length === 0" class="rounded-xl border border-border bg-card p-12 text-center">
            <p class="text-base font-medium">No releases yet</p>
            <p class="mt-2 text-sm text-muted-foreground">
              Stay tuned — the first release is on its way.
            </p>
          </div>

          <!-- Feed -->
          <ol v-else class="space-y-6">
            <li
              v-for="(release, idx) in releases"
              :key="release.tag_name"
            >
              <Card>
                <CardContent class="p-8">
                  <div class="flex flex-wrap items-center gap-3">
                    <Badge :variant="idx === 0 ? 'default' : 'secondary'" class="font-mono">
                      {{ release.tag_name }}
                    </Badge>
                    <Badge v-if="idx === 0" variant="outline">
                      Latest
                    </Badge>
                    <span class="inline-flex items-center gap-1 text-xs text-muted-foreground">
                      <PhCalendarBlank :size="12" />
                      {{ formatDate(release.published_at) }}
                    </span>
                  </div>

                  <h2 class="mt-3 text-2xl font-semibold tracking-tight">
                    {{ release.name || release.tag_name }}
                  </h2>

                  <div
                    v-if="release.body"
                    class="prose prose-sm mt-4 max-w-none text-foreground prose-headings:font-semibold prose-headings:tracking-tight prose-h1:text-xl prose-h2:text-lg prose-h3:text-base prose-p:text-muted-foreground prose-a:text-primary prose-a:no-underline hover:prose-a:underline prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-xs prose-code:font-mono prose-code:before:content-none prose-code:after:content-none prose-pre:bg-muted prose-pre:border prose-pre:border-border prose-li:text-muted-foreground prose-strong:text-foreground"
                    v-html="renderMarkdown(release.body)"
                  />

                  <div class="mt-6">
                    <Button as-child variant="outline" size="sm">
                      <a :href="release.html_url" target="_blank" rel="noopener noreferrer">
                        View on GitHub
                        <PhArrowSquareOut :size="14" />
                      </a>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </li>
          </ol>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* Tailwind typography is not loaded by default — minimal prose styling for safety */
:deep(.prose) {
  line-height: 1.7;
}
:deep(.prose ul) {
  list-style: disc;
  padding-left: 1.5rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}
:deep(.prose ol) {
  list-style: decimal;
  padding-left: 1.5rem;
  margin-top: 0.75rem;
  margin-bottom: 0.75rem;
}
:deep(.prose li) {
  margin-top: 0.25rem;
  margin-bottom: 0.25rem;
}
:deep(.prose h1),
:deep(.prose h2),
:deep(.prose h3) {
  margin-top: 1.5rem;
  margin-bottom: 0.5rem;
}
:deep(.prose p) {
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
:deep(.prose pre) {
  padding: 1rem;
  border-radius: 0.5rem;
  overflow-x: auto;
  font-size: 0.8125rem;
}
:deep(.prose hr) {
  margin: 1.5rem 0;
  border-color: hsl(var(--border));
}
</style>
