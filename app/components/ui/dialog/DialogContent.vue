<script setup lang="ts">
import type { HTMLAttributes } from 'vue'
import type { DialogContentEmits, DialogContentProps } from 'reka-ui'
import {
  DialogContent as RekaDialogContent,
  DialogOverlay,
  DialogPortal,
  useForwardPropsEmits,
} from 'reka-ui'
import { cn } from '~/lib/utils'

const props = defineProps<DialogContentProps & { class?: HTMLAttributes['class'] }>()
const emits = defineEmits<DialogContentEmits>()

// `class` is ours, everything else is forwarded untouched so callers keep
// reka's escapeKeyDown / interactOutside / closeAutoFocus escape hatches.
const delegatedProps = computed(() => {
  const { class: _, ...rest } = props
  return rest
})
const forwarded = useForwardPropsEmits(delegatedProps, emits)
</script>

<template>
  <!-- The portal is required, not cosmetic: SiteHeader carries `backdrop-blur-md`,
       and a non-none backdrop-filter makes that header a containing block for
       `position: fixed` descendants. Rendered in place, the overlay would be
       sized against the 64px header instead of the viewport. -->
  <DialogPortal>
    <!-- The overlay also owns the body scroll lock: reka calls
         `useBodyScrollLock` from DialogOverlayImpl, not from the content, so
         removing this node silently removes the lock.
         `bg-background/80` rather than shadcn's `bg-black/80`, which appears
         nowhere in this project and would be wrong in light mode. -->
    <DialogOverlay
      class="fixed inset-0 z-50 bg-background/80 backdrop-blur-sm
             motion-safe:data-[state=open]:animate-in
             motion-safe:data-[state=open]:fade-in-0
             motion-safe:data-[state=open]:duration-300
             motion-safe:data-[state=open]:ease-out
             motion-safe:data-[state=closed]:animate-out
             motion-safe:data-[state=closed]:fade-out-0
             motion-safe:data-[state=closed]:duration-200
             motion-safe:data-[state=closed]:ease-in"
    />

    <!-- Positioner. Centring by flex rather than `-translate-*`: the animate
         utilities rewrite `transform` wholesale, so a transform-centred panel
         would jump out of centre for the duration of the animation.
         `items-start sm:items-center` + `overflow-y-auto` keeps the panel
         reachable on a short viewport (landscape phone) instead of clipping it. -->
    <!-- `pointer-events-none` is load-bearing, not a detail: DialogPortal is a
         plain Teleport and renders its slot unconditionally. DialogOverlay and
         DialogContent each gate themselves with Presence, but this positioner
         does not, so without it an invisible `inset-0 z-50` layer sits over the
         whole page while the dialog is CLOSED and nothing anywhere is
         clickable. The panel re-enables pointer events for itself. -->
    <div class="pointer-events-none fixed inset-0 z-50 flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <!-- Width is set by the longest atomic string on the page, the support
           address. 27 characters at font-mono text-xs need ~194px, and the row
           around it costs 60px (padding, gap, copy button). A card must
           therefore be ~254px inside its own padding, which at two columns
           puts the panel at 672px = max-w-2xl. max-w-xl (576px) left 216px and
           the address was truncated. -->
      <RekaDialogContent
        v-bind="forwarded"
        aria-modal="true"
        :class="cn(
          'pointer-events-auto relative my-auto max-h-[calc(100dvh-2rem)] w-full max-w-2xl overflow-y-auto rounded-xl border border-border bg-background p-5 shadow-lg sm:p-6',
          'motion-safe:data-[state=open]:animate-in motion-safe:data-[state=open]:fade-in-0 motion-safe:data-[state=open]:zoom-in-95 motion-safe:data-[state=open]:slide-in-from-bottom-2 motion-safe:data-[state=open]:duration-300 motion-safe:data-[state=open]:ease-out',
          'motion-safe:data-[state=closed]:animate-out motion-safe:data-[state=closed]:fade-out-0 motion-safe:data-[state=closed]:zoom-out-95 motion-safe:data-[state=closed]:slide-out-to-bottom-2 motion-safe:data-[state=closed]:duration-200 motion-safe:data-[state=closed]:ease-in',
          props.class,
        )"
      >
        <slot />
      </RekaDialogContent>
    </div>
  </DialogPortal>
</template>
