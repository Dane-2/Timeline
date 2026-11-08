/**
 * Unlock times are stored in UTC. In the editor you pick a wall-clock time
 * ("Dec 25, 8:00 AM") plus the timezone it should happen in; these helpers
 * convert both ways, DST-aware, using only Intl.
 */

export const commonTimezones = [
  'America/New_York',
  'America/Chicago',
  'America/Denver',
  'America/Phoenix',
  'America/Los_Angeles',
  'America/Anchorage',
  'Pacific/Honolulu',
  'UTC',
]

export const browserTimezone = Intl.DateTimeFormat().resolvedOptions().timeZone

/** Offset (ms) of `tz` from UTC at instant `utcMs`. */
function tzOffset(utcMs: number, tz: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone: tz,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(utcMs))
  const get = (t: string) => Number(parts.find((p) => p.type === t)?.value)
  const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'))
  return asUtc - utcMs
}

/** "2026-12-25T08:00" in `tz` → ISO UTC string. */
export function wallTimeToUtc(wall: string, tz: string): string {
  const [d, t = '00:00'] = wall.split('T')
  const [y, mo, da] = d.split('-').map(Number)
  const [h, mi] = t.split(':').map(Number)
  const guess = Date.UTC(y, mo - 1, da, h, mi)
  let utc = guess - tzOffset(guess, tz)
  utc = guess - tzOffset(utc, tz) // second pass settles DST edges
  return new Date(utc).toISOString()
}

/** ISO UTC → "2026-12-25T08:00" as seen in `tz` (for datetime-local inputs). */
export function utcToWallTime(iso: string, tz: string): string {
  const ms = new Date(iso).getTime()
  const local = new Date(ms + tzOffset(ms, tz))
  return local.toISOString().slice(0, 16)
}

export function formatInZone(iso: string, tz: string): string {
  return new Date(iso).toLocaleString(undefined, {
    timeZone: tz,
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}
