import { motion } from 'motion/react'
import type { ContentItem, LockedPreview } from '../../types/content'
import { formatLongDate } from '../../lib/dates'
import { SectionLabel } from './SectionLabel'

type Row =
  | { locked: false; id: string; date: string | null; title: string; caption: string | null }
  | { locked: true; id: string; date: string | null; title: string }

export function TimelinePreview({ entries, locked }: { entries: ContentItem[]; locked: LockedPreview[] }) {
  const rows: Row[] = [
    ...entries.map((e) => ({ locked: false as const, id: e.id, date: e.event_date, title: e.title, caption: e.caption })),
    ...locked
      .filter((l) => l.kind === 'timeline')
      .map((l) => ({ locked: true as const, id: l.id, date: l.event_date ?? l.unlock_at, title: l.occasion ?? 'Not yet…' })),
  ]
    .sort((a, b) => (a.date ?? '').localeCompare(b.date ?? ''))
    .slice(-4)

  return (
    <section aria-label="Timeline preview">
      <SectionLabel to="/timeline">Along the way</SectionLabel>
      {rows.length === 0 ? (
        <p className="hand text-ink-soft text-xl">The first page of the timeline is still being glued in.</p>
      ) : (
        <ol className="relative ml-3 border-l-2 border-dashed border-mauve/40 pl-6">
          {rows.map((r, i) => (
            <motion.li
              key={r.id}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.08 }}
              className="relative pb-5 last:pb-0"
            >
              <span
                aria-hidden
                className={`absolute top-1 -left-[2.0625rem] grid h-4 w-4 place-items-center rounded-full border-2 ${
                  r.locked ? 'border-mauve/50 bg-cream' : 'border-mauve bg-blush'
                }`}
              />
              <p className="stamp text-ink-soft">{r.date ? formatLongDate(r.date) : 'someday'}</p>
              <p className="font-display text-base font-semibold">
                {r.locked && <span aria-label="Locked">🔒 </span>}
                {r.title}
              </p>
              {!r.locked && r.caption && <p className="hand text-mauve text-lg leading-tight">{r.caption}</p>}
            </motion.li>
          ))}
        </ol>
      )}
    </section>
  )
}
