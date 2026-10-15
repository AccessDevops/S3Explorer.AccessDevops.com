// RSS 2.0 feed of the guides, prerendered at build time (see nitro.prerender
// in nuxt.config.ts) so it is a static file on the CDN, not a function call.
//
// It lets aggregators pick up new guides, and Medium / dev.to import them
// with the canonical URL pointing back here.

import { loadGuidesFromDisk } from '../../../app/lib/guide-files'

const SITE = 'https://s3explorer.accessdevops.com'

function esc(s: string): string {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}

const rfc822 = (iso: string) => new Date(`${iso}T00:00:00Z`).toUTCString()

export default defineEventHandler((event) => {
  const guides = loadGuidesFromDisk()
  const items = guides.map((g) => {
    const url = `${SITE}/guides/${g.slug}/`
    return `    <item>
      <title>${esc(g.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <description>${esc(g.description)}</description>
      <pubDate>${rfc822(g.published)}</pubDate>
    </item>`
  }).join('\n')

  setHeader(event, 'Content-Type', 'application/rss+xml; charset=utf-8')
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>S3 Explorer guides</title>
    <link>${SITE}/guides/</link>
    <description>Technical guides for S3-compatible object storage.</description>
    <language>en</language>
    <atom:link href="${SITE}/guides/rss.xml" rel="self" type="application/rss+xml" />
${guides[0] ? `    <lastBuildDate>${rfc822(guides[0].updated)}</lastBuildDate>\n` : ''}${items}
  </channel>
</rss>
`
})
