import { motion } from 'motion/react'
import type { ContentItem } from '../../types/content'

const placeholders = ['TBA', 'SECRET SET', '??? B2B ???', 'SPECIAL GUEST', 'TBA', 'LATE NIGHT SET']

/** A festival lineup poster where every act is a memory. */
export function Lineup({ items, onOpen }: { items: ContentItem[]; onOpen: (item: ContentItem) => void }) {
  const empty = items.length === 0
  const names = empty ? placeholders.map((title) => ({ id: null, title })) : items.map((i) => ({ id: i.id, title: i.title || 'untitled' }))
  const [headliner, ...rest] = names
  const second = rest.slice(0, 3)
  const third = rest.slice(3)

  const act = (n: { id: string | null; title: string }, className: string) => {
    const item = n.id ? items.find((i) => i.id === n.id) : undefined
    return item ? (
      <button key={n.id} onClick={() => onOpen(item)} className={`${className} uppercase transition hover:text-[#c6ff3d]`}>
        {n.title}
      </button>
    ) : (
      <span key={`${n.title}-${className}`} className={`${className} uppercase opacity-40`}>
        {n.title}
      </span>
    )
  }

  return (
    <section aria-label="Lineup" className="text-center">
      <p className="font-mono text-[0.7rem] tracking-[0.45em] text-[#00f0ff] uppercase">— the lineup —</p>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="mt-5 space-y-4"
      >
        {headliner && <div>{act(headliner, 'rave-display neon-pink chroma block w-full text-4xl font-black leading-none sm:text-6xl')}</div>}
        {second.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1">
            {second.map((n, i) => (
              <span key={`${n.title}-${i}`} className="flex items-center gap-3">
                {i > 0 && <span className="text-[#ff2bd6]">✦</span>}
                {act(n, 'rave-display text-xl font-bold text-white sm:text-3xl')}
              </span>
            ))}
          </div>
        )}
        {third.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-x-3 gap-y-1 font-mono text-sm tracking-[0.2em] text-white/75">
            {third.map((n, i) => (
              <span key={`${n.title}-${i}`} className="flex items-center gap-3">
                {i > 0 && <span className="text-[#c6ff3d]">/</span>}
                {act(n, '')}
              </span>
            ))}
          </div>
        )}
      </motion.div>
    </section>
  )
}
