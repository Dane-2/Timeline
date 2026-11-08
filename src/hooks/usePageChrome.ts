import { useEffect } from 'react'

/**
 * While mounted, paint the page background and the browser's theme color
 * (iPhone status bar / overscroll) to match a themed room. Restores on exit.
 */
export function usePageChrome(color: string) {
  useEffect(() => {
    const body = document.body.style
    const meta = document.querySelector<HTMLMetaElement>('meta[name="theme-color"]')
    const prev = { bg: body.backgroundColor, meta: meta?.content }
    body.backgroundColor = color
    if (meta) meta.content = color
    return () => {
      body.backgroundColor = prev.bg
      if (meta && prev.meta) meta.content = prev.meta
    }
  }, [color])
}
