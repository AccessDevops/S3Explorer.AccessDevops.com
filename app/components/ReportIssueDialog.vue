<script setup lang="ts">
import { PhArrowRight, PhCheck, PhCopy, PhEnvelopeSimple, PhGithubLogo, PhX } from '@phosphor-icons/vue'
import { Badge } from '~/components/ui/badge'
import { Button } from '~/components/ui/button'
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogTitle,
} from '~/components/ui/dialog'
import { copyToClipboard } from '~/lib/clipboard'
import { REPORT_ISSUE_URL, SUPPORT_EMAIL, SUPPORT_EMAIL_URL } from '~/lib/constants'

const open = defineModel<boolean>('open', { required: true })

const props = defineProps<{
  /** Which trigger opened the dialog, for the analytics event. */
  where: string
  /** The element to put focus back on when the dialog closes. reka stores
   *  `getActiveElement()` at mount, which is `body` on Safari after a mouse
   *  click, and then suppresses the native restore — so focus would be lost.
   *  The header tracks the real trigger and hands it over. */
  returnFocusTo?: HTMLElement | null
}>()

const { trackReportChannelChosen } = useDownloadTracking()

const emailCard = ref<HTMLElement | null>(null)
const copyState = ref<'idle' | 'copied' | 'failed'>('idle')
let copyTimer: ReturnType<typeof setTimeout> | undefined

function resetCopyState() {
  clearTimeout(copyTimer)
  copyState.value = 'idle'
}

async function copyEmail() {
  trackReportChannelChosen('email', props.where)
  // The card element, not document.body: reka's focus trap pulls focus back
  // from anything outside the dialog, which would break the execCommand
  // fallback exactly when it is needed. See app/lib/clipboard.ts.
  const method = await copyToClipboard(SUPPORT_EMAIL, emailCard.value)
  copyState.value = method === 'failed' ? 'failed' : 'copied'
  clearTimeout(copyTimer)
  copyTimer = setTimeout(() => { copyState.value = 'idle' }, 2000)
}

// The timer must not outlive the dialog or the component.
watch(open, (isOpen) => { if (!isOpen) resetCopyState() })
onBeforeUnmount(() => clearTimeout(copyTimer))
</script>

<template>
  <Dialog v-model:open="open">
    <DialogContent @close-auto-focus.prevent="props.returnFocusTo?.focus()">
      <DialogClose as-child>
        <Button variant="ghost" size="icon-sm" class="absolute right-3 top-3" aria-label="Close">
          <PhX :size="16" />
        </Button>
      </DialogClose>

      <!-- DialogTitle renders the h2 and reka wires aria-labelledby to it.
           DialogDescription is not optional: reka always generates a
           description id and always emits aria-describedby, so omitting it
           leaves the attribute pointing at nothing on every page. -->
      <DialogTitle class="pr-10 text-lg font-semibold leading-none tracking-tight">
        Report an issue
      </DialogTitle>
      <DialogDescription class="mt-2 text-sm text-muted-foreground">
        Two ways to reach the developer.
      </DialogDescription>

      <!-- `pt-3` reserves the row the badge overhangs into (`-top-3`). -->
      <div class="mt-5 grid gap-4 pt-3 sm:grid-cols-2">
        <!-- Both cards share one skeleton: an icon + title + one-liner header,
             an action row, then a muted caveat pinned to the bottom. Same
             rhythm on both sides so the eye compares the content, not the
             layout. The email card is a plain div, not a button: its action is
             the copy control next to the address, and a button inside a button
             is invalid markup and a second tab stop inside one card. -->
        <div
          ref="emailCard"
          class="flex flex-col rounded-xl border border-border bg-muted/30 p-4 text-left sm:p-5"
        >
          <!-- Row 1: icon and title only. -->
          <div class="flex items-center gap-3">
            <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PhEnvelopeSimple :size="20" weight="duotone" />
            </div>
            <h3 class="text-base font-semibold leading-tight">Email</h3>
          </div>

          <!-- Row 2. `min-h` reserves two lines on both cards, so the action
               rows below stay on the same horizontal line whatever the width:
               the GitHub blurb wraps to two lines before this one does. -->
          <p class="mt-3 min-h-[2.5rem] text-sm text-muted-foreground">
            No account needed
          </p>

          <!-- Row 3: the address, shown in full — never truncated. -->
          <div class="mt-1 flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
            <span class="min-w-0 flex-1 font-mono text-xs text-primary">
              {{ SUPPORT_EMAIL }}
            </span>
            <button
              type="button"
              class="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              :aria-label="copyState === 'copied' ? 'Address copied' : 'Copy address'"
              @click="copyEmail"
            >
              <PhCheck v-if="copyState === 'copied'" :size="15" class="text-primary" />
              <PhCopy v-else :size="15" />
            </button>
          </div>

          <!-- Row 4: the caveat, quieter than the body copy. -->
          <p class="mt-auto pt-4 text-xs text-muted-foreground/70">
            {{ copyState === 'failed' ? 'Copy failed — select the address above' : 'Expect a slower response' }}
          </p>
        </div>

        <!-- GitHub. Stays a real link to REPORT_ISSUE_URL, the pre-filled issue
             template from constants.ts — do not reduce it to /issues/new. -->
        <a
          :href="REPORT_ISSUE_URL"
          target="_blank"
          rel="noopener noreferrer"
          class="group relative flex flex-col rounded-xl border border-primary bg-muted/30 p-4 text-left shadow-lg ring-1 ring-primary/30 transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background active:translate-y-0 active:shadow-sm sm:p-5"
          @click="trackReportChannelChosen('github', props.where)"
        >
          <Badge class="absolute -top-3 left-1/2 -translate-x-1/2">Recommended</Badge>

          <!-- Row 1: icon and title only, same as the email card. -->
          <div class="flex items-center gap-3">
            <div class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <PhGithubLogo :size="20" weight="duotone" />
            </div>
            <h3 class="text-base font-semibold leading-tight">GitHub issue</h3>
          </div>

          <!-- Row 2, same reserved height as the email card. -->
          <p class="mt-3 min-h-[2.5rem] text-sm text-muted-foreground">
            Faster response. Pre-filled form
          </p>

          <!-- Row 3: mirrors the email card's bordered row, so both calls to
               action sit on the same line. A span, not a nested button: the
               card is already the link. -->
          <span class="mt-1 flex items-center justify-between gap-2 rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium text-primary">
            Open an issue
            <PhArrowRight :size="15" class="shrink-0 transition-transform group-hover:translate-x-0.5" />
          </span>

          <!-- Row 4. -->
          <span class="mt-auto pt-4 text-xs text-muted-foreground/70">
            GitHub account required
          </span>
        </a>
      </div>

      <!-- Swapping a button's visible label is not reliably announced, so the
           copy outcome gets its own live region. -->
      <p role="status" aria-live="polite" class="sr-only">
        {{ copyState === 'copied' ? 'Address copied to clipboard' : copyState === 'failed' ? 'Copy failed, select the address manually' : '' }}
      </p>

      <p class="mt-4 text-center text-xs text-muted-foreground">
        <a :href="SUPPORT_EMAIL_URL" class="underline underline-offset-2 hover:text-foreground">
          Or open your mail app
        </a>
      </p>
    </DialogContent>
  </Dialog>
</template>
