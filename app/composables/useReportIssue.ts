/**
 * Shared state for the "Report an issue" dialog.
 *
 * The dialog is mounted once, in SiteHeader, which is on every page. Anything
 * else that used to link straight to the issue tracker calls `openReportIssue`
 * instead, so one dialog serves the header, the footer and the legal pages.
 *
 * Every caller keeps a real `<a href>` underneath: `openReportIssue` only
 * swallows a plain left click, so the link still works without JavaScript,
 * before hydration, and on Cmd-click or middle-click.
 */
// Module scope, not inside the composable: every caller must share the same
// ref, or the header's dialog would never see the element a page set. Not
// `useState` either — a DOM node must not be serialised into the SSR payload,
// and this is only ever written from a click handler, on the client.
const trigger = shallowRef<HTMLElement | null>(null)

export function useReportIssue() {
  const open = useState('report-issue-open', () => false)
  // Mounted on first open only, so reka's Dialog stays out of the layout chunk.
  const mounted = useState('report-issue-mounted', () => false)
  const where = useState('report-issue-where', () => 'header')

  function openReportIssue(event: MouseEvent, from: string) {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return
    event.preventDefault()
    where.value = from
    trigger.value = event.currentTarget as HTMLElement
    mounted.value = true
    open.value = true
  }

  return { open, mounted, where, trigger, openReportIssue }
}
