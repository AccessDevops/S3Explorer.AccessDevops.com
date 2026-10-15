// See server/utils/llms.ts.
import { buildLlmsFullTxt } from '../utils/llms'

export default defineEventHandler((event) => {
  setHeader(event, 'Content-Type', 'text/plain; charset=utf-8')
  return buildLlmsFullTxt()
})
