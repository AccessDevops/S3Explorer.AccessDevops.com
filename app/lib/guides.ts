// The guides as the pages see them: every content/guides/*.md file, parsed
// and rendered to HTML at build time. See guide-source.ts for the format.

import { Marked } from 'marked'
import { parseGuide, slugFromPath, sortGuides, type GuideMeta } from './guide-source'
import { SITE } from './constants'

export interface Guide extends GuideMeta {
  html: string
}

const files = import.meta.glob('../../content/guides/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>

// A dedicated instance: news.vue calls marked.setOptions() on the global one
// with `breaks: true`, which would turn every wrapped line of a guide into a
// <br>.
const md = new Marked({ gfm: true })

md.use({
  renderer: {
    // The page owns the only <h1>. A `#` in a guide becomes an <h2>.
    heading({ tokens, depth }) {
      const level = Math.max(depth, 2)
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`
    },
    // Screenshots sit below the fold: don't let them compete with the text
    // for the first paint.
    image({ href, title, text }) {
      const t = title ? ` title="${title}"` : ''
      return `<img src="${href}" alt="${text}"${t} loading="lazy" decoding="async">`
    },
    // Outbound links open elsewhere; links to this site stay in the tab.
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens)
      const t = title ? ` title="${title}"` : ''
      const external = /^https?:\/\//.test(href) && !href.startsWith(SITE.domain)
      return external
        ? `<a href="${href}"${t} target="_blank" rel="noopener noreferrer">${label}</a>`
        : `<a href="${href}"${t}>${label}</a>`
    },
  },
})

export const GUIDES: Guide[] = sortGuides(
  Object.entries(files).map(([path, raw]) => {
    const { body, ...meta } = parseGuide(slugFromPath(path), raw)
    return { ...meta, html: md.parse(body) as string }
  }),
)

export function getGuide(slug: string): Guide | undefined {
  return GUIDES.find(g => g.slug === slug)
}

export function guidesForProvider(providerId: string): Guide[] {
  return GUIDES.filter(g => g.providers.includes(providerId))
}
