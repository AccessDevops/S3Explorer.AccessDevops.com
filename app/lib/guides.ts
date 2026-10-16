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

const attr = (s: string) => s.replace(/&(?!amp;|lt;|gt;|quot;|#39;)/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Outbound links that stay followed: our own repositories and the author.
const OWN_HOSTS = ['https://github.com/AccessDevops/', 'https://cbarange.com']

md.use({
  renderer: {
    // The page owns the only <h1>. A `#` in a guide becomes an <h2>.
    heading({ tokens, depth }) {
      const level = Math.max(depth, 2)
      return `<h${level}>${this.parser.parseInline(tokens)}</h${level}>\n`
    },
    // Screenshots sit below the fold: don't let them compete with the text
    // for the first paint.
    // Alt text is escaped: it often quotes UI labels, and a raw `"` would end
    // the attribute.
    image({ href, title, text }) {
      const t = title ? ` title="${attr(title)}"` : ''
      return `<img src="${attr(href)}" alt="${attr(text)}"${t} loading="lazy" decoding="async">`
    },
    // Outbound links open elsewhere; links to this site stay in the tab.
    // They are nofollow unless they point at something of ours: guides cite
    // competitors and vendors as sources, and a followed link would pass them
    // ranking the guide was written to earn.
    link({ href, title, tokens }) {
      const label = this.parser.parseInline(tokens)
      const t = title ? ` title="${title}"` : ''
      const external = /^https?:\/\//.test(href) && !href.startsWith(SITE.domain)
      if (!external) return `<a href="${href}"${t}>${label}</a>`
      const rel = OWN_HOSTS.some(p => href.startsWith(p)) ? 'noopener noreferrer' : 'nofollow noopener noreferrer'
      return `<a href="${href}"${t} target="_blank" rel="${rel}">${label}</a>`
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
