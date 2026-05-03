<script setup lang="ts">
import { PhCheckCircle, PhX } from '@phosphor-icons/vue'
import { Button } from '~/components/ui/button'

defineProps<{
  show: boolean
  referralId: string
  clipboardCopied: boolean
}>()

const emit = defineEmits<{
  close: []
}>()
</script>

<template>
  <Transition
    enter-active-class="transition duration-300 ease-out"
    enter-from-class="opacity-0 translate-y-4"
    enter-to-class="opacity-100 translate-y-0"
    leave-active-class="transition duration-200 ease-in"
    leave-from-class="opacity-100 translate-y-0"
    leave-to-class="opacity-0 translate-y-4"
  >
    <div
      v-if="show"
      role="status"
      aria-live="polite"
      class="fixed bottom-6 left-1/2 z-50 w-[min(440px,calc(100vw-2rem))] -translate-x-1/2"
    >
      <div class="rounded-xl border border-border bg-card p-4 shadow-lg">
        <div class="flex items-start gap-3">
          <div class="mt-0.5 flex-shrink-0">
            <PhCheckCircle v-if="clipboardCopied" :size="20" weight="fill" class="text-primary" />
            <PhCheckCircle v-else :size="20" class="text-muted-foreground" />
          </div>
          <div class="flex-1 space-y-1.5">
            <p class="text-sm font-medium text-card-foreground">
              {{ clipboardCopied ? 'Referral code copied to clipboard' : 'Download started' }}
            </p>
            <p class="text-xs text-muted-foreground">
              {{ clipboardCopied
                ? 'Paste it in S3 Explorer on first launch to link your session.'
                : 'Your code (copy manually if your browser blocked clipboard):' }}
            </p>
            <code class="inline-block rounded border border-border bg-muted px-2 py-1 font-mono text-xs">
              {{ referralId }}
            </code>
          </div>
          <Button variant="ghost" size="icon-sm" aria-label="Dismiss" @click="emit('close')">
            <PhX :size="14" />
          </Button>
        </div>
      </div>
    </div>
  </Transition>
</template>
