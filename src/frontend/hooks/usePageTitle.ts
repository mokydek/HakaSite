import { useEffect } from 'react'

const BASE_TITLE = 'Hackathon platform'

/**
 * Sets the document title for the current route. Pass a page name to get
 * "Page name · Hackathon platform", or nothing for the base title. The
 * separator is a middot, not a hyphen.
 */
export function usePageTitle(title?: string): void {
  useEffect(() => {
    document.title = title ? `${title} · ${BASE_TITLE}` : BASE_TITLE
    return () => {
      document.title = BASE_TITLE
    }
  }, [title])
}
