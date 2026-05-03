import type { Release, ReleaseAsset } from './useReleases'

export type Platform =
  | 'macos'
  | 'windows-x64'
  | 'windows-arm64'
  | 'linux-amd64'
  | 'linux-aarch64'
  | 'unknown'

export interface DownloadOption {
  id: string
  /** Visual group header (one of: 'macOS', 'Windows x64', 'Windows ARM64',
   *  'Linux x64', 'Linux ARM64'). Used by the UI to render grouped pills. */
  group: string
  /** Compact pill label, e.g. ".dmg" or "AppImage". */
  label: string
  /** Longer free-form description shown as `title` tooltip on hover. */
  description: string
  url: string
  filename: string
  /** Tag of the release that actually contains this asset. May be older than
   *  the absolute latest if that release didn't ship this specific format. */
  version: string
}

export interface PrimaryDownload {
  label: string
  url: string
  filename: string
  version: string
}

// -----------------------------------------------------------------------------
// Installer specs — one entry per user-facing installer format.
// Order in this array drives the order of pills in the "Other platforms" pavé.
// `isPrimaryFor` flags the recommended installer for each detected OS so the
// hero CTA picks a sensible default. Auto-updater bundles (`.app.tar.gz`,
// `.nsis.zip`, `.AppImage.tar.gz`), `.sig` files and `latest.json` are
// excluded by design — they're consumed by the Tauri updater inside the app,
// never by humans.
// Match functions are anchored regex (`$`) to prevent `_amd64.AppImage` from
// matching `_amd64.AppImage.tar.gz` as well.
// -----------------------------------------------------------------------------

interface InstallerSpec {
  id: string
  group: string
  /** Compact label shown inside the pill (terse: ".dmg", "AppImage", ".msi"). */
  label: string
  /** Free-form context shown as the pill's `title` tooltip on hover. */
  description: string
  /** When defined, this installer is the recommended primary download for
   *  visitors detected as running this platform. Exactly one spec per
   *  platform should set this. */
  isPrimaryFor?: Platform
  match: (asset: ReleaseAsset) => boolean
}

const INSTALLERS: InstallerSpec[] = [
  // macOS — single universal binary covers Intel + Apple Silicon natively
  {
    id: 'macos-dmg',
    group: 'macOS',
    label: '.dmg',
    description: 'Universal — Apple Silicon + Intel',
    isPrimaryFor: 'macos',
    match: a => /\.dmg$/i.test(a.name),
  },

  // Windows x64
  {
    id: 'win-x64-exe',
    group: 'Windows x64',
    label: '.exe',
    description: 'NSIS installer — recommended',
    isPrimaryFor: 'windows-x64',
    match: a => /_x64[-_]setup\.exe$/i.test(a.name),
  },
  {
    id: 'win-x64-msi',
    group: 'Windows x64',
    label: '.msi',
    description: 'For GPO / SCCM / silent install',
    match: a => /_x64_.*\.msi$/i.test(a.name),
  },

  // Windows ARM64
  {
    id: 'win-arm64-exe',
    group: 'Windows ARM64',
    label: '.exe',
    description: 'NSIS installer — recommended',
    isPrimaryFor: 'windows-arm64',
    match: a => /_arm64[-_]setup\.exe$/i.test(a.name),
  },
  {
    id: 'win-arm64-msi',
    group: 'Windows ARM64',
    label: '.msi',
    description: 'For GPO / SCCM / silent install',
    match: a => /_arm64_.*\.msi$/i.test(a.name),
  },

  // Linux x64 (amd64 / x86_64)
  {
    id: 'linux-amd64-appimage',
    group: 'Linux x64',
    label: 'AppImage',
    description: 'Portable — runs on any distro',
    isPrimaryFor: 'linux-amd64',
    match: a => /_amd64\.AppImage$/i.test(a.name),
  },
  {
    id: 'linux-amd64-deb',
    group: 'Linux x64',
    label: '.deb',
    description: 'Debian / Ubuntu',
    match: a => /_amd64\.deb$/i.test(a.name),
  },
  {
    id: 'linux-amd64-rpm',
    group: 'Linux x64',
    label: '.rpm',
    description: 'Fedora / RHEL / openSUSE',
    match: a => /[._-]x86_64\.rpm$/i.test(a.name),
  },

  // Linux ARM64 (aarch64)
  {
    id: 'linux-arm64-appimage',
    group: 'Linux ARM64',
    label: 'AppImage',
    description: 'Portable — runs on any distro',
    isPrimaryFor: 'linux-aarch64',
    match: a => /_aarch64\.AppImage$/i.test(a.name),
  },
  {
    id: 'linux-arm64-deb',
    group: 'Linux ARM64',
    label: '.deb',
    description: 'Debian / Ubuntu',
    match: a => /_arm64\.deb$/i.test(a.name),
  },
  {
    id: 'linux-arm64-rpm',
    group: 'Linux ARM64',
    label: '.rpm',
    description: 'Fedora / RHEL',
    match: a => /[._-]aarch64\.rpm$/i.test(a.name),
  },
]

// -----------------------------------------------------------------------------
// Platform detection
// -----------------------------------------------------------------------------

function detectPlatform(): Platform {
  if (typeof window === 'undefined') return 'unknown'

  const userAgent = navigator.userAgent.toLowerCase()
  const platformString = navigator.platform?.toLowerCase() || ''

  // Mobile detection — must run BEFORE the desktop OS checks because:
  //   - Android UAs contain "Linux" (would match the Linux branch below)
  //   - iPadOS 13+ identifies as "Macintosh" (would match the macOS branch)
  // Mobile users can't run a desktop installer, so we return 'unknown' and
  // let the page show the generic GitHub releases fallback.
  const isMobile = /android|iphone|ipad|ipod/.test(userAgent)
    || (typeof navigator.maxTouchPoints === 'number'
      && navigator.maxTouchPoints > 1
      && /macintosh/.test(userAgent))
  if (isMobile) return 'unknown'

  if (userAgent.includes('mac') || platformString.includes('mac')) {
    return 'macos'
  }

  if (userAgent.includes('win') || platformString.includes('win')) {
    if (
      userAgent.includes('arm')
      || userAgent.includes('aarch64')
      || platformString.includes('arm')
    ) {
      return 'windows-arm64'
    }
    return 'windows-x64'
  }

  if (userAgent.includes('linux') || platformString.includes('linux')) {
    if (
      userAgent.includes('aarch64')
      || userAgent.includes('arm64')
      || platformString.includes('aarch64')
    ) {
      return 'linux-aarch64'
    }
    return 'linux-amd64'
  }

  return 'unknown'
}

// -----------------------------------------------------------------------------
// Resolver — walks releases newest-first to find the first one that ships a
// given installer spec. Used both for the visitor's own platform (single
// best match) and to populate the "Other platforms" pavé (one match per spec).
// -----------------------------------------------------------------------------

function findFirstReleaseWithSpec(
  releases: Release[],
  spec: InstallerSpec,
): { release: Release, asset: ReleaseAsset } | null {
  for (const release of releases) {
    const asset = release.assets.find(a => spec.match(a))
    if (asset) return { release, asset }
  }
  return null
}

function getExtensionLabel(filename: string): string {
  if (/\.dmg$/i.test(filename)) return '.dmg'
  if (/\.exe$/i.test(filename)) return '.exe'
  if (/\.msi$/i.test(filename)) return '.msi'
  if (/\.AppImage$/i.test(filename)) return '.AppImage'
  if (/\.deb$/i.test(filename)) return '.deb'
  if (/\.rpm$/i.test(filename)) return '.rpm'
  return ''
}

/**
 * Build the "Other platforms" pavé. One entry per declared installer spec
 * (so MSI sits alongside NSIS on Windows, and .deb/.rpm sit alongside
 * AppImage on Linux). Each entry walks releases newest-first independently,
 * so a missing format on the latest release transparently rolls back to the
 * previous release that shipped it. Specs without any match in the scanned
 * releases are simply omitted.
 */
export function buildAllDownloadOptions(releases: Release[]): DownloadOption[] {
  const options: DownloadOption[] = []
  for (const spec of INSTALLERS) {
    const match = findFirstReleaseWithSpec(releases, spec)
    if (!match) continue
    options.push({
      id: spec.id,
      group: spec.group,
      label: spec.label,
      description: spec.description,
      url: match.asset.browser_download_url,
      filename: match.asset.name,
      version: match.release.tag_name,
    })
  }
  return options
}

const PLATFORM_LABELS: Record<Platform, string> = {
  'macos': 'macOS',
  'windows-x64': 'Windows',
  'windows-arm64': 'Windows (ARM)',
  'linux-amd64': 'Linux',
  'linux-aarch64': 'Linux (ARM)',
  'unknown': '',
}

export function useOsDetection() {
  const platform = ref<Platform>('unknown')
  const isDetecting = ref(true)

  onMounted(() => {
    platform.value = detectPlatform()
    isDetecting.value = false
  })

  const platformLabel = computed(() => PLATFORM_LABELS[platform.value])

  /**
   * Find the best primary download for the visitor's detected platform,
   * walking through releases newest-first. Uses the spec flagged
   * `isPrimaryFor` for that platform (e.g. AppImage on Linux, NSIS on
   * Windows). Returns null if no release ever shipped a primary for this
   * platform — caller should fall back to the GitHub releases page link.
   */
  function getPrimaryDownload(releases: Release[]): PrimaryDownload | null {
    if (platform.value === 'unknown') return null
    const spec = INSTALLERS.find(s => s.isPrimaryFor === platform.value)
    if (!spec) return null
    const match = findFirstReleaseWithSpec(releases, spec)
    if (!match) return null
    return {
      label: `Download for ${platformLabel.value} (${getExtensionLabel(match.asset.name)})`,
      url: match.asset.browser_download_url,
      filename: match.asset.name,
      version: match.release.tag_name,
    }
  }

  return {
    platform,
    platformLabel,
    isDetecting,
    getPrimaryDownload,
  }
}
