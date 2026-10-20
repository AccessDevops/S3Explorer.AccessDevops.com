<script setup lang="ts">
import { buildAllDownloadOptions } from '~/composables/useOsDetection'
import type { DownloadOption } from '~/composables/useOsDetection'

// `releases` is the foundation now (full list of recent releases). The smart
// resolver in useOsDetection walks this list newest-first to find the most
// recent release that ships an installer for the visitor's platform — so
// missing platform builds never produce broken download links.
// `version` here is the absolute-latest tag, used as a fallback display.
const {
  releases,
  version: latestVersion,
  releasesPageUrl,
  loading: releaseLoading,
} = useGithubRelease()
const { platform, isDetecting, getPrimaryDownload } = useOsDetection()

const {
  trackPageView,
  trackPlatformDetected,
  trackDownloadClicked,
  trackAllPlatformsOpened,
  trackGithubReleasesOpened,
  trackVideoPlayed,
  trackResolverFallback,
  clipboardCopied,
  referralId,
} = useDownloadTracking()

useStructuredData(latestVersion.value)

useSeoMeta({
  ogUrl: 'https://s3explorer.accessdevops.com/',
})

const primaryDownload = computed(() => getPrimaryDownload(releases.value))
const allDownloads = computed(() => buildAllDownloadOptions(releases.value))

// Version shown in the download button: tag of the matched release for the
// visitor's platform if we have one, else the absolute latest tag.
const buttonVersion = computed(() => primaryDownload.value?.version || latestVersion.value)

const showAllPlatforms = ref(false)
const showClipboardToast = ref(false)
let toastTimer: ReturnType<typeof setTimeout> | null = null

onMounted(() => {
  trackPageView('landing')
})

watch(platform, (val) => {
  if (val !== 'unknown') {
    trackPlatformDetected(val)
  }
})

// Silent-failure observability: if the platform is detected, the releases
// list is loaded, AND the resolver still found nothing, that's the symptom
// of a naming convention drift on the upstream Tauri build pipeline. Fire
// a PostHog event so it shows up in monitoring.
const fallbackReported = ref(false)
watch(
  [releaseLoading, isDetecting, primaryDownload],
  ([loading, detecting, primary]) => {
    if (loading || detecting) return
    if (fallbackReported.value) return
    if (
      platform.value !== 'unknown'
      && primary === null
      && releases.value.length > 0
    ) {
      trackResolverFallback(platform.value)
      fallbackReported.value = true
    }
  },
)

async function handleDownload(url: string, filename: string = '') {
  await trackDownloadClicked({
    platform: platform.value,
    filename,
    url,
    // Send the version of the actual release the user is downloading, not
    // the absolute latest. Lets PostHog funnels accurately attribute installs.
    version: primaryDownload.value?.version || latestVersion.value,
    sourceUi: 'primary_button',
  })

  startDownload(url)
}

/** A pill from the "other platforms" list. Reports the chosen platform, not
 *  the detected one: someone opening that list is usually there because the
 *  detected platform was not what they wanted. */
async function handleDownloadOption(option: DownloadOption) {
  await trackDownloadClicked({
    platform: option.platform,
    filename: option.filename,
    url: option.url,
    version: option.version,
    sourceUi: 'platform_list',
    assetId: option.id,
  })

  startDownload(option.url)
}

/** Shared tail of both download paths: show the clipboard toast, then
 *  navigate. The asset URL serves an attachment, so the page is not unloaded
 *  and the capture issued just above completes normally. */
function startDownload(url: string) {
  showClipboardToast.value = true
  if (toastTimer) clearTimeout(toastTimer)
  toastTimer = setTimeout(() => { showClipboardToast.value = false }, 4500)

  window.location.href = url
}

function handleToggleAllPlatforms() {
  showAllPlatforms.value = !showAllPlatforms.value
  if (showAllPlatforms.value) {
    trackAllPlatformsOpened()
  }
}

function handleVideoPlay() {
  trackVideoPlayed()
}

const isLoadingDownload = computed(() => isDetecting.value || releaseLoading.value)
</script>

<template>
  <div>
    <HeroSection
      :primary="primaryDownload"
      :loading="isLoadingDownload"
      :releases-page-url="releasesPageUrl"
      :version="buttonVersion"
      :show-all-platforms="showAllPlatforms"
      :all-downloads="allDownloads"
      @download="handleDownload"
      @download-option="handleDownloadOption"
      @open-releases="trackGithubReleasesOpened"
      @toggle-all-platforms="handleToggleAllPlatforms"
    />

    <DemoVideoSection @engaged="handleVideoPlay" />

    <FeaturesSection />

    <ProvidersSection />

    <CtaSection
      :primary="primaryDownload"
      :loading="isLoadingDownload"
      :releases-page-url="releasesPageUrl"
      @download="handleDownload"
    />

    <DownloadToast
      :show="showClipboardToast"
      :referral-id="referralId"
      :clipboard-copied="clipboardCopied"
      @close="showClipboardToast = false"
    />
  </div>
</template>
