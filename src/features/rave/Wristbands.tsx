import { motion } from 'motion/react'
import type { ContentItem } from '../../types/content'
import { formatShortDate } from '../../lib/dates'

const pairs = [
  ['#ff2bd6', '#8a4dff'],
  ['#00f0ff', '#2b6bff'],
  ['#c6ff3d', '#00d68f'],
  ['#ff8a00', '#ff2bd6'],
]

/** Text-only memories, as festival wristbands. */
export function Wristbands({ items, onOpen }: { items: ContentItem[]; onOpen: (item: ContentItem) => void }) {
  if (!items.length) return null
  return (
    <section aria-label="Wristbands">
      <h2 className="rave-display neon-pink mb-6 text-center text-2xl font-bold uppercase">Wristband collection</h2>
      <ul className="mx-auto max-w-xl space-y-4">
        {items.map((item, i) => {
          const [c1, c2] = pairs[i % pairs.length]
          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: i % 2 ? 40 : -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ rotate: `${i % 2 ? 1.2 : -1.2}deg` }}
            >
              <button
                onClick={() => onOpen(item)}
                className="wristband flex w-full items-center justify-between gap-3 px-7 py-3 text-left text-black transition-transform hover:scale-[1.02]"
                style={{ ['--c1' as string]: c1, ['--c2' as string]: c2 }}
              >
                <span className="font-mono text-[0.6rem] font-bold tracking-[0.3em] uppercase opacity-70">Admit one</span>
                <span className="rave-display flex-1 truncate text-center text-sm font-bold uppercase">{item.title}</span>
                <span className="font-mono text-[0.6rem] font-bold tracking-[0.2em] uppercase opacity-70">
                  {item.event_date ? formatShortDate(item.event_date) : 'all ages'}
                </span>
              </button>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
