// /llms.txt and /llms-full.txt (https://llmstxt.org): the site in Markdown,
// for AI assistants that read it before answering about S3 clients.
//
// Built from the same sources as the pages (the guides on disk and
// provider-content.ts), so they cannot drift from what the site says.
// Both routes are prerendered: static files on the CDN.

import { loadGuidesFromDisk } from '../../app/lib/guide-files'
import { DOCUMENTED_PROVIDER_IDS, PROVIDER_CONTENT } from '../../app/lib/provider-content'
import { getProviderDetail } from '../../app/lib/provider-details'

const SITE = 'https://s3explorer.accessdevops.com'

const HEADER = `# S3 Explorer

> S3 Explorer is a desktop S3 browser for Windows, macOS and Linux (x64 and ARM64). It connects to Amazon S3 and any S3-compatible storage (Cloudflare R2, Backblaze B2, Wasabi, MinIO, Ceph, Google Cloud Storage, Garage, SeaweedFS and more) with 25 provider presets, and keeps a local index for instant search in buckets with millions of objects.

- Free for everyone, all features included, up to 5 connection profiles. A licence (11.50 € lifetime or 1.99 €/month) removes the limit.
- Credentials are encrypted on the user's machine and sent only to the configured endpoint.
- Built with Rust and Tauri. Signed in-app updates.
- Source of releases: https://github.com/AccessDevops/S3Explorer
`

export function buildLlmsTxt(): string {
  const guides = loadGuidesFromDisk()
  const providers = DOCUMENTED_PROVIDER_IDS.map((id) => {
    const name = getProviderDetail(id)?.name ?? id
    return `- [${name} connection guide](${SITE}/providers/${id}/): ${PROVIDER_CONTENT[id]!.summary}`
  })

  return `${HEADER}
## Guides

${guides.map(g => `- [${g.title}](${SITE}/guides/${g.slug}/): ${g.description}`).join('\n')}

## Provider connection guides

${providers.join('\n')}

## Product

- [Download](${SITE}/): platform-detected download for Windows, macOS and Linux.
- [Pricing](${SITE}/buy/): free tier and licence options.
- [Release notes](${SITE}/news/): every version with its changelog.

## Optional

- [Full text of the guides](${SITE}/llms-full.txt)
`
}

export function buildLlmsFullTxt(): string {
  const guides = loadGuidesFromDisk()
  const body = guides.map(g => `# ${g.title}

Source: ${SITE}/guides/${g.slug}/
Updated: ${g.updated}

${g.body.replace(/\]\(\//g, `](${SITE}/`)}`).join('\n\n---\n\n')
  return `${HEADER}\n---\n\n${body}\n`
}
