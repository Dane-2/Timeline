import { motion } from 'motion/react'
import type { ContentItem } from '../../types/content'

const boards = [
  ['#ff6f91', '#ffe39a'],
  ['#2a9bc0', '#fffaf2'],
  ['#ffb38a', '#145f80'],
  ['#ffe39a', '#ff6f91'],
  ['#8fd3f4', '#ff9a76'],
]

/** Text-only beach memories, as a quiver of surfboards. */
export function Surfboards({ items, onOpen }: { items: ContentItem[]; onOpen: (item: ContentItem) => void }) {
  if (!items.length) return null
  return (
    <section aria-label="The quiver">
      <h2 className="beach-script mb-6 text-center text-3xl text-[#0f4c5c]">the quiver</h2>
      <ul className="mx-auto max-w-xl space-y-5">
        {items.map((item, i) => {
          const [deck, stripe] = boards[i % boards.length]
          return (
            <motion.li
              key={item.id}
              initial={{ opacity: 0, x: i % 2 ? 60 : -60 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: 'spring', stiffness: 90, damping: 15 }}
              style={{ rotate: `${i % 2 ? 2 : -2}deg` }}
            >
              <button
                onClick={() => onOpen(item)}
                className="surfboard relative flex h-16 w-full items-center justify-center overflow-hidden px-12 transition-transform hover:-translate-y-1"
                style={{ background: `linear-gradient(90deg, ${deck} 0 44%, ${stripe} 44% 47%, ${deck} 47% 53%, ${stripe} 53% 56%, ${deck} 56%)` }}
              >
                <span aria-hidden className="absolute inset-y-0 left-1/2 w-px bg-black/15" />
                <span className="relative truncate rounded-full bg-white/85 px-4 py-1 font-sans text-sm font-bold tracking-wide text-[#0f4c5c] uppercase">
                  {item.title}
                </span>
              </button>
            </motion.li>
          )
        })}
      </ul>
    </section>
  )
}
