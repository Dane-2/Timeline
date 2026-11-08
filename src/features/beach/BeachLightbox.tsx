import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { ContentItem } from '../../types/content'
import { formatLongDate } from '../../lib/dates'

export function BeachLightbox({ item, onClose }: { item: ContentItem; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={item.title}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="beach-root fixed inset-0 z-50 flex items-center justify-center bg-[#0f4c5c]/45 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ y: 40, rotate: -3 }}
        animate={{ y: 0, rotate: -1 }}
        exit={{ y: 20, opacity: 0 }}
        onClick={(e) => e.stopPropagation()}
        className="beach-card w-full max-w-sm rounded-2xl px-6 pt-7 pb-6 text-center"
      >
        {item.event_date && <p className="text-[0.65rem] font-bold tracking-[0.3em] text-[#ff6f91] uppercase">{formatLongDate(item.event_date)}</p>}
        <h2 className="beach-script mt-2 text-3xl text-[#0f4c5c]">{item.title}</h2>
        {(item.caption || item.body.text) && <p className="hand text-ink mt-3 text-xl leading-snug">{item.caption ?? item.body.text}</p>}
        {item.hidden_message && <p className="hand mt-3 text-lg text-[#ff6f91]">p.s. {item.hidden_message}</p>}
        <button onClick={onClose} className="mt-6 rounded-full bg-[#0f4c5c] px-6 py-2 text-sm font-semibold text-white">
          Back to the beach
        </button>
      </motion.div>
    </motion.div>
  )
}
