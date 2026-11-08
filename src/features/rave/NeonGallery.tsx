import { motion } from 'motion/react'
import type { ContentItem } from '../../types/content'
import { useSignedUrl } from '../../hooks/useSignedUrl'
import { formatShortDate } from '../../lib/dates'

const glow = ['#ff2bd6', '#00f0ff', '#c6ff3d', '#8a4dff']

interface Props {
  items: ContentItem[]
  pathFor: (id: string) => string | undefined
  onOpen: (item: ContentItem, src: string | null) => void
}

export function NeonGallery({ items, pathFor, onOpen }: Props) {
  if (!items.length) return null
  return (
    <section aria-label="Rave photos">
      <h2 className="rave-display neon-cyan mb-6 text-center text-2xl font-bold uppercase">Proof it happened</h2>
      <ul className="grid grid-cols-2 gap-5 sm:grid-cols-3 sm:gap-7">
        {items.map((item, i) => (
          <NeonPhoto key={item.id} item={item} index={i} path={pathFor(item.id)} onOpen={onOpen} />
        ))}
      </ul>
    </section>
  )
}

function NeonPhoto({ item, index, path, onOpen }: { item: ContentItem; index: number; path?: string; onOpen: Props['onOpen'] }) {
  const src = useSignedUrl(path)
  const color = glow[index % glow.length]
  const tilt = index % 2 ? 2 : -2
  return (
    <motion.li
      initial={{ opacity: 0, y: 24, rotate: tilt * 3 }}
      whileInView={{ opacity: 1, y: 0, rotate: tilt }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{ type: 'spring', stiffness: 140, damping: 16, delay: (index % 3) * 0.06 }}
    >
      <button
        onClick={() => onOpen(item, src)}
        className="neon-frame group block w-full overflow-hidden rounded-lg bg-black text-left transition-transform hover:scale-[1.03]"
        style={{ ['--c' as string]: color }}
      >
        <div className="aspect-[4/5] w-full bg-white/5">
          {src && <img src={src} alt={item.title} loading="lazy" className="h-full w-full object-cover saturate-[1.2] group-hover:saturate-150" />}
        </div>
        <div className="px-3 py-2">
          <p className="truncate font-mono text-[0.7rem] tracking-[0.15em] text-white uppercase">{item.title}</p>
          {item.event_date && <p className="font-mono text-[0.6rem] tracking-[0.2em]" style={{ color }}>{formatShortDate(item.event_date)}</p>}
        </div>
      </button>
    </motion.li>
  )
}
