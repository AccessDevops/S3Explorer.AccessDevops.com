<script setup lang="ts">
import type { NuxtError } from '#app'

// Deliberately free of any @phosphor-icons import. This component is the one
// thing that may still be rendered by the Netlify function, and that package
// ships thousands of per-icon modules whose cold-start cost already pushed
// the function past its file-descriptor limit once. An error page that
// crashes turns a 404 into a 500, which is how unknown URLs on this site
// used to answer.
const props = defineProps<{ error: NuxtError }>()

const is404 = computed(() => props.error?.statusCode === 404)

useSeoMeta({
  title: is404.value ? 'Page not found — S3 Explorer' : 'Something went wrong — S3 Explorer',
  // `noindex` only for a genuine not-found, never for a transient failure.
  //
  // This component also replaces the page when an error happens *after* a
  // successful fetch — a hydration failure, a chunk that 404s because a
  // deploy landed between the HTML and its JavaScript. Google renders pages
  // before indexing them, so it reads whatever that render produced: on
  // 2026-10-18 it fetched the home page successfully, rendered this
  // component instead, and dropped the URL with "Excluded by 'noindex' tag".
  //
  // A missing page should say so permanently; a page that failed once must
  // not. For those the HTTP status already tells Google to come back later,
  // and an unconditional `noindex` overrides it with "never index this" —
  // removal is immediate, re-inclusion takes weeks.
  robots: is404.value ? 'noindex, follow' : undefined,
})
</script>

<template>
  <div class="flex min-h-screen flex-col bg-background">
    <main class="container flex flex-1 items-center justify-center py-20">
      <div class="mx-auto max-w-lg text-center">
        <p class="font-mono text-sm text-muted-foreground">
          {{ error?.statusCode ?? 500 }}
        </p>
        <h1 class="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
          {{ is404 ? 'This page does not exist' : 'Something went wrong' }}
        </h1>
        <p class="mt-4 text-lg leading-relaxed text-muted-foreground">
          <template v-if="is404">
            The address may be mistyped, or the page may have been moved.
          </template>
          <template v-else>
            The error has been logged. Trying again in a moment usually works.
          </template>
        </p>

        <div class="mt-8 flex flex-wrap items-center justify-center gap-3">
          <NuxtLink
            to="/"
            class="inline-flex items-center justify-center rounded-md bg-primary px-6 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Back to the home page
          </NuxtLink>
          <NuxtLink
            to="/providers/"
            class="inline-flex items-center justify-center rounded-md border border-input bg-background px-6 py-2.5 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
          >
            Provider guides
          </NuxtLink>
        </div>
      </div>
    </main>
  </div>
</template>
