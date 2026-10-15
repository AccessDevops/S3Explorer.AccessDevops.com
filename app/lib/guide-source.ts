// Parsing for the Markdown guides in content/guides/.
//
// Kept free of Vite and Nuxt APIs on purpose: nuxt.config.ts (plain Node, to
// list the routes to prerender and put in the sitemap), the RSS route (Nitro)
// and the pages (Vite) all read the same files, each in its own way, and all
// of them go through this one parser. A guide therefore exists everywhere or
// nowhere — same rule as provider-content.ts.
//
// File name = slug: content/guides/minio-console-alternative.md is served at
// /guides/minio-console-alternative/.

export interface GuideMeta {
  slug: string
  /** <title> and <h1>. Carry the words people search for. */
  title: string
  /** ~155 chars: meta description, search snippet, index summary, RSS. */
  description: string
  /** ISO date (YYYY-MM-DD). */
  published: string
  /** ISO date; defaults to `published`. Drives sitemap lastmod and dateModified. */
  updated: string
  /** Provider ids (see providers.ts) whose pages list this guide as related. */
  providers: string[]
  /** Absolute path under public/, used for og:image. Falls back to the site image. */
  image?: string
  imageAlt?: string
}

export interface GuideSource extends GuideMeta {
  /** Markdown body, frontmatter removed. */
  body: string
}

const REQUIRED = ['title', 'description', 'published'] as const
const DATE = /^\d{4}-\d{2}-\d{2}$/

// Frontmatter is a flat `key: value` block. Lists use the inline YAML form
// `[a, b]`. That is all the guides need, and it avoids a YAML dependency for
// four fields.
function parseFrontmatter(block: string): Record<string, string | string[]> {
  const out: Record<string, string | string[]> = {}
  for (const line of block.split(/\r?\n/)) {
    if (!line.trim() || line.trim().startsWith('#')) continue
    const idx = line.indexOf(':')
    if (idx === -1) throw new Error(`frontmatter line without "key:": ${line}`)
    const key = line.slice(0, idx).trim()
    const raw = line.slice(idx + 1).trim()
    const unquote = (s: string) => s.replace(/^(['"])(.*)\1$/, '$2')
    out[key] = raw.startsWith('[') && raw.endsWith(']')
      ? raw.slice(1, -1).split(',').map(s => unquote(s.trim())).filter(Boolean)
      : unquote(raw)
  }
  return out
}

export function parseGuide(slug: string, raw: string): GuideSource {
  const match = raw.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) throw new Error(`guide "${slug}": missing frontmatter block`)
  const fm = parseFrontmatter(match[1]!)

  for (const key of REQUIRED) {
    if (typeof fm[key] !== 'string' || !fm[key]) throw new Error(`guide "${slug}": "${key}" is required`)
  }
  const str = (k: string) => (typeof fm[k] === 'string' ? fm[k] as string : undefined)
  const published = str('published')!
  const updated = str('updated') ?? published
  for (const d of [published, updated]) {
    if (!DATE.test(d)) throw new Error(`guide "${slug}": date "${d}" is not YYYY-MM-DD`)
  }

  return {
    slug,
    title: str('title')!,
    description: str('description')!,
    published,
    updated,
    providers: Array.isArray(fm.providers) ? fm.providers : [],
    image: str('image'),
    imageAlt: str('imageAlt'),
    body: match[2]!.trim(),
  }
}

/** Newest first, by last update. */
export function sortGuides<T extends GuideMeta>(guides: T[]): T[] {
  return [...guides].sort((a, b) => b.updated.localeCompare(a.updated) || a.slug.localeCompare(b.slug))
}

/** Slug from a path such as `content/guides/foo.md` or `/abs/…/foo.md`. */
export function slugFromPath(path: string): string {
  return path.replace(/\\/g, '/').split('/').pop()!.replace(/\.md$/, '')
}
