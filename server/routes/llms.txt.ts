// See server/utils/llms.ts.
import { buildLlmsTxt } from '../utils/llms'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return buildLlmsTxt()
})
