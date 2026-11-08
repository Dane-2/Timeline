import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCalmMode } from '../../hooks/useCalmMode'

const SEEN_KEY = 'little-piece:rave-intro'
const steps = ['lights down…', '3', '2', '1', 'DROP']

function alreadySeen() {
  try {
    return sessionStorage.getItem(SEEN_KEY) === 'true'
  } catch {
    return false
  }
}

/** The short "lights down… 3 2 1 DROP" moment, once per visit. Tap to skip. */
export function DropIntro() {
  const reduced = useReducedMotion()
  const { calm } = useCalmMode()
  const [step, setStep] = useState(() => (reduced || calm || alreadySeen() ? -1 : 0))

  useEffect(() => {
    if (step < 0) return
    if (step >= steps.length) {
      setStep(-1)
      return
    }
    const id = window.setTimeout(() => setStep((s) => s + 1), step === 0 ? 700 : step === steps.length - 1 ? 650 : 380)
    return () => window.clearTimeout(id)
  }, [step])

  useEffect(() => {
    try {
      sessionStorage.setItem(SEEN_KEY, 'true')
    } catch {
      /* ignore */
    }
  }, [])

  const isDrop = steps[step] === 'DROP'

  return (
    <AnimatePresence>
      {step >= 0 && step < steps.length && (
        <motion.button
          key="intro"
          aria-label="Skip intro"
          onClick={() => setStep(-1)}
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, transition: { duration: 0.35 } }}
          className="rave-root fixed inset-0 z-[60] grid place-items-center bg-[#06030c]"
        >
          <AnimatePresence mode="wait">
            <motion.span
              key={step}
              initial={{ opacity: 0, scale: isDrop ? 2.2 : 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: isDrop ? 0.25 : 0.18 }}
              className={`rave-display font-black ${
                step === 0 ? 'text-lg tracking-[0.3em] text-white/70 uppercase' : isDrop ? 'neon-pink chroma text-7xl' : 'neon-cyan text-6xl'
              }`}
            >
              {steps[step]}
            </motion.span>
          </AnimatePresence>
          {/* One soft colored flash on the drop — not a strobe */}
          {isDrop && (
            <motion.span
              aria-hidden
              initial={{ opacity: 0.45 }}
              animate={{ opacity: 0 }}
              transition={{ duration: 0.6 }}
              className="absolute inset-0 bg-[radial-gradient(circle,#ff2bd6,transparent_70%)]"
            />
          )}
        </motion.button>
      )}
    </AnimatePresence>
  )
}
