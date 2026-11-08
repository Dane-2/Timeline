import { useState } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { useCalmMode } from '../../hooks/useCalmMode'

const colors = ['#ff2bd6', '#00f0ff', '#c6ff3d']

/**
 * A few soft colored pulses — 2.5 per second, never white, never full opacity —
 * so it feels like a drop without being a strobe. Calm mode gets one pulse.
 */
export function DropButton({ onDrop }: { onDrop?: () => void }) {
  const reduced = useReducedMotion()
  const { calm } = useCalmMode()
  const [pulse, setPulse] = useState<number | null>(null)

  function drop() {
    if (pulse !== null) return
    onDrop?.()
    const count = reduced || calm ? 1 : colors.length
    for (let i = 0; i < count; i++) window.setTimeout(() => setPulse(i), i * 400)
    window.setTimeout(() => setPulse(null), count * 400 + 200)
  }

  return (
    <div className="text-center">
      <motion.button
        onClick={drop}
        whileTap={{ scale: 0.92 }}
        className="rave-display rounded-full border-2 border-[#c6ff3d] px-8 py-4 text-sm font-black tracking-[0.2em] text-[#c6ff3d] uppercase shadow-[0_0_24px_-4px_#c6ff3d] transition hover:bg-[#c6ff3d] hover:text-black"
      >
        Drop the bass
      </motion.button>
      <AnimatePresence>
        {pulse !== null && (
          <motion.div
            key={pulse}
            aria-hidden
            initial={{ opacity: 0.32 }}
            animate={{ opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.38 }}
            className="pointer-events-none fixed inset-0 z-40"
            style={{ background: `radial-gradient(circle at 50% 60%, ${colors[pulse]}, transparent 70%)` }}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
