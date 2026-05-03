<script setup lang="ts">
import { PhGithubLogo } from '@phosphor-icons/vue'
import { REPO } from '~/lib/constants'

const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-border/50 bg-background">
    <div class="container py-12">
      <div class="grid gap-8 md:grid-cols-4">
        <div class="md:col-span-2">
          <div class="flex items-center gap-2 font-semibold">
            <img src="/icon-128.png" alt="" class="h-7 w-7" />
            <span>S3 Explorer</span>
          </div>
          <p class="mt-3 max-w-md text-sm text-muted-foreground">
            The modern desktop app for S3-compatible storage. Free to use, license available to support development and unlock unlimited connection profiles.
          </p>
        </div>

        <div>
          <h3 class="text-sm font-semibold">Product</h3>
          <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><NuxtLink to="/" class="hover:text-foreground">Home</NuxtLink></li>
            <li><NuxtLink to="/buy" class="hover:text-foreground">Buy a license</NuxtLink></li>
            <li><NuxtLink to="/news" class="hover:text-foreground">News</NuxtLink></li>
            <li>
              <a :href="REPO.releasesUrl" target="_blank" rel="noopener noreferrer" class="hover:text-foreground">
                Downloads
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h3 class="text-sm font-semibold">Resources</h3>
          <ul class="mt-3 space-y-2 text-sm text-muted-foreground">
            <li>
              <a :href="REPO.url" target="_blank" rel="noopener noreferrer" class="inline-flex items-center gap-1 hover:text-foreground">
                <PhGithubLogo :size="14" /> GitHub
              </a>
            </li>
            <li>
              <a :href="`${REPO.url}/issues`" target="_blank" rel="noopener noreferrer" class="hover:text-foreground">
                Report an issue
              </a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-10 flex flex-col items-start justify-between gap-2 border-t border-border/50 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
        <p>&copy; {{ year }} AccessDevops. All rights reserved.</p>
        <p>Made with care for developers and ops teams.</p>
      </div>
    </div>
  </footer>
</template>
