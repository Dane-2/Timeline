import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ContentItem } from '../../types/content'
import { StickyNote } from '../../components/scrapbook/StickyNote'
import { SectionLabel } from './SectionLabel'

const tilts = [-4, 3, -2, 5]

export function NoteWallPreview({ notes }: { notes: ContentItem[] }) {
  const [flipped, setFlipped] = useState<string | null>(null)
  const shown = notes.slice(0, 2)

  return (
    <section aria-label="Sticky notes">
      <SectionLabel to="/notes" linkLabel="the whole wall">Sticky notes</SectionLabel>
      {shown.length === 0 ? (
        <p className="hand text-ink-soft text-xl">The wall is still empty. Not for long.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-4">
          {shown.map((n, i) => {
            const showBack = flipped === n.id && n.hidden_message
            return (
              <li key={n.id}>
                <StickyNote
                  color={n.body.color}
                  rotate={tilts[i % tilts.length]}
                  onClick={() => setFlipped(flipped === n.id ? null : n.id)}
                  label={n.hidden_message ? 'Sticky note — tap to flip' : undefined}
                >
                  <AnimatePresence mode="wait" initial={false}>
                    <motion.p
                      key={showBack ? 'back' : 'front'}
                      initial={{ opacity: 0, rotateX: 70 }}
                      animate={{ opacity: 1, rotateX: 0 }}
                      exit={{ opacity: 0, rotateX: -70 }}
                      transition={{ duration: 0.2 }}
                      className="hand text-ink text-xl leading-snug sm:text-2xl"
                    >
                      {showBack ? n.hidden_message : n.title || n.body.text}
                    </motion.p>
                  </AnimatePresence>
                  {n.hidden_message && !showBack && (
                    <span className="stamp text-mauve/80 mt-auto text-[0.58rem]">psst — tap</span>
                  )}
                </StickyNote>
              </li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
