import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCalmMode } from '../../hooks/useCalmMode'

const SEEN_KEY = 'little-piece:seal-boot'

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === 'true'
  } catch {
    return false
  }
}

/** "Establishing secure uplink… ACCESS GRANTED". Once per visit; tap to skip. */
export function BootSequence({ clearance }: { clearance: string }) {
  const reduced = useReducedMotion()
  const { calm } = useCalmMode()
  const lines = [
    '> ESTABLISHING SECURE UPLINK…',
    '> ENCRYPTION: AES-256 … OK',
    '> VERIFYING BIOMETRICS … OK',
    `> CLEARANCE: ${clearance}`,
    '> ACCESS GRANTED',
  ]
  const [shown, setShown] = useState(() => (reduced || calm || alreadySeen() ? -1 : 0))

  useEffect(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, 'true')
    } catch {
      /* ignore */
    }
  }, [])

  useEffect(() => {
    if (shown < 0) return
    const id = window.setTimeout(() => setShown((n) => (n >= lines.length + 1 ? -1 : n + 1)), shown === lines.length ? 700 : 330)
    return () => window.clearTimeout(id)
  }, [shown, lines.length])

  return (
    <AnimatePresence>
      {shown >= 0 && (
        <motion.button
          key="boot"
          aria-label="Skip"
          onClick={() => setShown(-1)}
          exit={{ opacity: 0, transition: { duration: 0.3 } }}
          className="seal-root fixed inset-0 z-[60] flex items-center justify-center bg-[#050705] px-6 text-left"
        >
          <div className="w-full max-w-sm space-y-2 text-sm">
            {lines.slice(0, shown).map((l, i) => (
              <p key={l} className={i === lines.length - 1 ? 'stencil nvg-text pt-3 text-2xl' : 'nvg-text'}>
                {l}
              </p>
            ))}
            {shown < lines.length && <p className="nvg-text blink-cursor" />}
          </div>
        </motion.button>
      )}
    </AnimatePresence>
  )
}
