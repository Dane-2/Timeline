const dayMs = 24 * 60 * 60 * 1000

export function formatLongDate(iso: string | null | undefined): string {
  if (!iso) return ''
  // Plain dates (YYYY-MM-DD) are calendar days, not instants: don't shift them by timezone.
  const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso)
  return date.toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })
}

export function formatShortDate(iso: string | null | undefined): string {
  if (!iso) return ''
  const date = /^\d{4}-\d{2}-\d{2}$/.test(iso) ? new Date(`${iso}T12:00:00`) : new Date(iso)
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' })
}

export interface Countdown {
  done: boolean
  days: number
  hours: number
  minutes: number
  seconds: number
}

export function countdownTo(targetIso: string, nowMs: number): Countdown {
  const diff = Math.max(0, new Date(targetIso).getTime() - nowMs)
  return {
    done: diff === 0,
    days: Math.floor(diff / dayMs),
    hours: Math.floor((diff % dayMs) / 3_600_000),
    minutes: Math.floor((diff % 3_600_000) / 60_000),
    seconds: Math.floor((diff % 60_000) / 1000),
  }
}

/** "in 3 days", "in 5 hours", "any minute now" */
export function describeCountdown(c: Countdown): string {
  if (c.done) return 'ready now'
  if (c.days > 1) return `in ${c.days} days`
  if (c.days === 1) return 'tomorrow-ish'
  if (c.hours >= 1) return `in ${c.hours} hour${c.hours === 1 ? '' : 's'}`
  if (c.minutes >= 1) return `in ${c.minutes} min`
  return 'any minute now'
}
