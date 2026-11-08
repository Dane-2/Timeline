import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { ContentItem } from '../../types/content'
import { formatLongDate } from '../../lib/dates'

export function RaveLightbox({ item, src, onClose }: { item: ContentItem; src: string | null; onClose: () => void }) {
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
      className="rave-root fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-4 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 16 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.95 }}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-md"
      >
        {src && (
          <img src={src} alt={item.title} className="neon-frame max-h-[62dvh] w-full rounded-lg object-contain" style={{ ['--c' as string]: '#00f0ff' }} />
        )}
        <div className="mt-5 text-center">
          {item.event_date && <p className="font-mono text-xs tracking-[0.3em] text-[#c6ff3d] uppercase">{formatLongDate(item.event_date)}</p>}
          <h2 className="rave-display neon-pink mt-2 text-2xl font-bold uppercase">{item.title}</h2>
          {(item.caption || item.body.text) && <p className="mt-3 text-white/80">{item.caption ?? item.body.text}</p>}
          {item.hidden_message && <p className="mt-3 font-mono text-sm text-[#00f0ff]">// {item.hidden_message}</p>}
        </div>
        <button onClick={onClose} className="mx-auto mt-6 block rounded-full border border-white/30 px-6 py-2 font-mono text-xs tracking-[0.25em] text-white uppercase hover:bg-white/10">
          Close
        </button>
      </motion.div>
    </motion.div>
  )
}
