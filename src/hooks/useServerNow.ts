import { useEffect, useState } from 'react'
import { serverNow, syncServerClock } from '../lib/serverClock'

/** Server-corrected "now", ticking every `intervalMs`. Display only. */
export function useServerNow(intervalMs = 30_000): number {
  const [now, setNow] = useState(serverNow)
  useEffect(() => {
    syncServerClock().then(() => setNow(serverNow()))
    const id = window.setInterval(() => setNow(serverNow()), intervalMs)
    return () => window.clearInterval(id)
  }, [intervalMs])
  return now
}
