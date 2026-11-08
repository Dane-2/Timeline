import { supabase } from './supabase'

/**
 * Countdowns are display-only (the database decides what is unlocked), but
 * they should still be right on a phone with a wrong clock. We measure the
 * offset between the device and the database once per page load.
 */
let offsetMs = 0
let synced: Promise<void> | null = null

export function syncServerClock(): Promise<void> {
  synced ??= (async () => {
    const sentAt = Date.now()
    const { data, error } = await supabase.rpc('server_now')
    const receivedAt = Date.now()
    if (error || typeof data !== 'string') return
    const serverMs = new Date(data).getTime()
    offsetMs = serverMs - (sentAt + receivedAt) / 2
  })()
  return synced
}

export function serverNow(): number {
  return Date.now() + offsetMs
}
