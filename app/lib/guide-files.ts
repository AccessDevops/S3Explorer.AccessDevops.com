// Node-only reader for content/guides/, for the two consumers that run outside
// Vite: nuxt.config.ts (prerender routes + sitemap) and the RSS route. The
// pages read the same files through import.meta.glob in guides.ts.
//
// Never import this from a component: it pulls in `node:fs`.

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parseGuide, slugFromPath, sortGuides, type GuideSource } from './guide-source'

export function loadGuidesFromDisk(root = process.cwd()): GuideSource[] {
  const dir = join(root, 'content', 'guides')
  let names: string[]
  try {
    names = readdirSync(dir).filter(n => n.endsWith('.md'))
  } catch {
    return []
  }
  return sortGuides(names.map(n => parseGuide(slugFromPath(n), readFileSync(join(dir, n), 'utf8'))))
}
