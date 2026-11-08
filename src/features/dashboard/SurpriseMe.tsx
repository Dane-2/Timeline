import { useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import type { ContentItem } from '../../types/content'
import { WashiTape } from '../../components/scrapbook/WashiTape'
import { Sparkle } from '../../components/scrapbook/Doodles'

const surpriseKinds = new Set(['photo', 'memory', 'sticky_note', 'inside_joke', 'quote', 'video', 'timeline'])

/**
 * Picks from content the server already returned as open — locked items are
 * never in this list, so they can't be revealed here.
 */
export function SurpriseMe({ items }: { items: ContentItem[] }) {
  const pool = items.filter((i) => surpriseKinds.has(i.kind))
  const [pick, setPick] = useState<ContentItem | null>(null)

  function draw() {
    if (!pool.length) return
    const options = pool.length > 1 ? pool.filter((p) => p.id !== pick?.id) : pool
    setPick(options[Math.floor(Math.random() * options.length)])
  }

  return (
    <section aria-label="Surprise me" className="text-center">
      <motion.button
        onClick={draw}
        disabled={!pool.length}
        whileHover={{ rotate: -2, scale: 1.04 }}
        whileTap={{ scale: 0.94, rotate: 3 }}
        className="bg-lavender text-cream shadow-lifted relative inline-flex items-center gap-2 rounded-full px-6 py-3 font-semibold disabled:opacity-50"
      >
        <Sparkle className="h-5 w-5" />
        Surprise me
      </motion.button>
      {!pool.length && <p className="hand text-ink-soft mt-2 text-lg">(nothing to draw from yet)</p>}

      <AnimatePresence mode="wait">
        {pick && (
          <motion.div
            key={pick.id}
            initial={{ opacity: 0, scale: 0.6, rotate: -12, y: 20 }}
            animate={{ opacity: 1, scale: 1, rotate: 2, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, rotate: 8 }}
            transition={{ type: 'spring', stiffness: 200, damping: 16 }}
            className="mx-auto mt-6 max-w-[18rem]"
          >
            <div className="border-petal relative rounded-2xl border bg-white px-6 pt-7 pb-6 text-center shadow-[0_18px_40px_-24px_rgb(140_97_120_/_0.6)]">
              <WashiTape variant="pink" className="-top-3 left-1/2 -translate-x-1/2" rotate={-2} width={72} />
              <span className="stamp text-mauve">{pick.kind.replace('_', ' ')}</span>
              <p className="font-display mt-2 text-lg font-semibold">{pick.title}</p>
              {(pick.caption || pick.body.text) && (
                <p className="hand text-ink-soft mt-1 text-xl leading-snug">{pick.caption ?? pick.body.text}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  )
}
