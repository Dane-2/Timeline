import { useEffect } from 'react'
import { motion } from 'motion/react'
import type { LockedPreview } from '../../types/content'
import { countdownTo, describeCountdown, formatShortDate } from '../../lib/dates'
import { useServerNow } from '../../hooks/useServerNow'
import { SealedEnvelope } from '../../components/scrapbook/SealedEnvelope'
import { SectionLabel } from './SectionLabel'

/**
 * Sealed envelopes for what's coming. These come from locked_previews(),
 * which only ever returns occasion/teaser/theme/time — never content.
 * When a countdown reaches zero we ask the server again; it decides.
 */
export function UpcomingSurprises({ previews, onSomethingUnlocked }: { previews: LockedPreview[]; onSomethingUnlocked: () => void }) {
  const now = useServerNow(15_000)
  const soonest = previews.find((p) => p.unlock_at)?.unlock_at
  const due = soonest ? countdownTo(soonest, now).done : false

  useEffect(() => {
    if (!due) return
    // Small delay so we don't race the database clock by a few hundred ms.
    // Re-runs after each refetch (new `previews`) until the server agrees.
    const id = window.setTimeout(onSomethingUnlocked, 2000)
    return () => window.clearTimeout(id)
  }, [due, previews, onSomethingUnlocked])

  return (
    <section aria-label="Coming soon">
      <SectionLabel to="/letters" linkLabel="all letters">Still sealed</SectionLabel>
      {previews.length === 0 ? (
        <p className="hand text-ink-soft text-xl">Nothing sealed right now… or is there?</p>
      ) : (
        <ul className="-mx-1 grid grid-cols-2 gap-3 sm:grid-cols-3">
          {previews.slice(0, 6).map((p, i) => {
            const cd = p.unlock_at ? countdownTo(p.unlock_at, now) : null
            return (
              <motion.li
                key={p.id}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.06 }}
                className="relative px-1"
                style={{ rotate: `${i % 2 ? 1.5 : -1.5}deg` }}
              >
                <SealedEnvelope theme={p.theme} className="w-full" />
                <div className="mt-1.5 text-center">
                  <p className="font-display truncate text-sm font-semibold">{p.occasion ?? 'A surprise'}</p>
                  <p className="hand text-mauve text-lg leading-none">
                    {cd ? describeCountdown(cd) : (p.locked_teaser ?? 'not quite time yet…')}
                  </p>
                  {p.unlock_at && <p className="stamp text-ink-soft mt-1 text-[0.6rem]">{formatShortDate(p.unlock_at)}</p>}
                </div>
              </motion.li>
            )
          })}
        </ul>
      )}
    </section>
  )
}
