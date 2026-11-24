/** How the text reached the clipboard, or that it did not. */
export type ClipboardMethod = 'async' | 'legacy' | 'failed'

/**
 * Put text on the clipboard.
 *
 * `navigator.clipboard.writeText` is the right API and works almost
 * everywhere, but it is refused outside a secure context, under some Firefox
 * configurations, and once the transient activation granted by the click has
 * lapsed.
 *
 * The fallback is the pre-Clipboard-API idiom: an off-screen textarea,
 * selected and copied synchronously. `document.execCommand` is deprecated but
 * implemented by every engine, and allowed in cases where the async API is
 * not — which is exactly when it is needed.
 *
 * `container` exists for the fallback only, and it matters inside a dialog.
 * reka-ui's `FocusScope` pulls focus back whenever a `focusin` fires on an
 * element outside the dialog, so a textarea appended to `document.body` loses
 * its selection before `execCommand` runs and the copy fails. Pass an element
 * inside the dialog and the focus trap leaves it alone.
 */
export async function copyToClipboard(
  text: string,
  container: HTMLElement | null = null,
): Promise<ClipboardMethod> {
  try {
    await navigator.clipboard.writeText(text)
    return 'async'
  }
  catch {
    // fall through to the legacy path
  }

  try {
    // Resolved inside the try, like every other `document` access here: the
    // function's contract is to return 'failed', never to reject. Its caller
    // on the download path awaits it before starting the download.
    const host = container ?? document.body
    const ta = document.createElement('textarea')
    ta.value = text
    // Off-screen rather than `display:none` or `hidden`: an unrendered
    // element cannot hold a selection, so the copy would fail for the wrong
    // reason. `readonly` keeps the mobile keyboard from appearing.
    ta.setAttribute('readonly', '')
    ta.style.position = 'fixed'
    ta.style.top = '-9999px'
    ta.style.opacity = '0'
    host.appendChild(ta)
    ta.select()
    ta.setSelectionRange(0, text.length)
    const ok = document.execCommand('copy')
    host.removeChild(ta)
    return ok ? 'legacy' : 'failed'
  }
  catch {
    return 'failed'
  }
}
