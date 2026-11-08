import { useState } from 'react'
import { motion } from 'motion/react'
import type { ContentItem } from '../../types/content'
import { useSignedUrl } from '../../hooks/useSignedUrl'
import { formatLongDate } from '../../lib/dates'

/** A vintage "Greetings from" postcard. Tap to flip it over and read the back. */
export function Postcard({ item, path, index }: { item: ContentItem; path?: string; index: number }) {
  const src = useSignedUrl(path)
  const [flipped, setFlipped] = useState(false)
  const tilt = index % 2 ? 1.6 : -1.6

  return (
    <motion.li
      initial={{ opacity: 0, y: 30, rotate: tilt * 3 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ type: 'spring', stiffness: 120, damping: 16 }}
      style={{ perspective: 1200 }}
    >
      <motion.button
        onClick={() => setFlipped((f) => !f)}
        aria-label={`${item.title} — postcard, tap to flip`}
        aria-pressed={flipped}
        animate={{ rotateY: flipped ? 180 : 0 }}
        transition={{ type: 'spring', stiffness: 90, damping: 14 }}
        className="relative block aspect-[3/2] w-full"
        style={{ transformStyle: 'preserve-3d' }}
      >
        {/* Front */}
        <div className="postcard-face beach-card absolute inset-0 overflow-hidden rounded-md border-[6px] border-[#fffaf2]">
          {src ? (
            <img src={src} alt={item.title} loading="lazy" className="h-full w-full object-cover saturate-[1.15] sepia-[.12]" />
          ) : (
            <div className="h-full w-full bg-gradient-to-b from-[#8fd3f4] to-[#ffb38a]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/45 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-3 text-left">
            <p className="font-sans text-[0.6rem] font-bold tracking-[0.3em] text-white/90 uppercase">Greetings from</p>
            <p className="retro-title truncate text-2xl leading-tight sm:text-3xl">{item.title}</p>
          </div>
        </div>
        {/* Back */}
        <div
          className="postcard-face beach-card absolute inset-0 grid grid-cols-[1.4fr_1fr] gap-3 rounded-md p-4 text-left"
          style={{ transform: 'rotateY(180deg)' }}
        >
          <div className="overflow-hidden border-r border-dashed border-[#0f4c5c]/25 pr-3">
            <p className="hand text-ink text-lg leading-snug sm:text-xl">{item.caption ?? item.body.text ?? '…'}</p>
            {item.hidden_message && <p className="hand mt-2 text-base text-[#ff6f91]">p.s. {item.hidden_message}</p>}
          </div>
          <div className="flex flex-col items-end justify-between">
            <div className="grid h-12 w-10 place-items-center border-2 border-dotted border-[#ff6f91] bg-[#ffd8b0] text-lg">🌴</div>
            <div className="w-full space-y-3 pb-1">
              <p className="hand text-ink-soft text-sm">{item.event_date ? formatLongDate(item.event_date) : ''}</p>
              <span className="block h-px bg-[#0f4c5c]/30" />
              <span className="block h-px bg-[#0f4c5c]/30" />
            </div>
          </div>
        </div>
      </motion.button>
    </motion.li>
  )
}
