import { useSyncExternalStore } from 'react'

const KEY = 'little-piece:calm'
const listeners = new Set<() => void>()

function read(): boolean {
  try {
    return localStorage.getItem(KEY) === 'true'
  } catch {
    return false
  }
}

let calm = read()
document.documentElement.dataset.calm = String(calm)

function setCalm(next: boolean) {
  calm = next
  document.documentElement.dataset.calm = String(next)
  try {
    localStorage.setItem(KEY, String(next))
  } catch {
    /* private mode — still works for this visit */
  }
  listeners.forEach((l) => l())
}

function subscribe(listener: () => void) {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/** In-site "less motion" switch, on top of the OS reduced-motion setting. Shared app-wide. */
export function useCalmMode() {
  const value = useSyncExternalStore(subscribe, () => calm)
  return { calm: value, toggle: () => setCalm(!calm) }
}
