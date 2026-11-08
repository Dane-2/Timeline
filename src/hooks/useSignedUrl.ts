import { useEffect, useState } from 'react'
import { getSignedUrl } from '../features/content/api'

export function useSignedUrl(path: string | null | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null)
  useEffect(() => {
    let cancelled = false
    if (!path) {
      setUrl(null)
      return
    }
    getSignedUrl(path).then((u) => {
      if (!cancelled) setUrl(u)
    })
    return () => {
      cancelled = true
    }
  }, [path])
  return url
}
