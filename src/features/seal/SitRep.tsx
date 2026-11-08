import { useState } from 'react'
import { motion } from 'motion/react'
import type { ContentItem } from '../../types/content'
import { useSignedUrl } from '../../hooks/useSignedUrl'

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/** Military date-time group, e.g. 091200ZNOV26 (UTC). */
export function dtg(iso: string): string {
  const d = new Date(iso)
  const p = (n: number) => String(n).padStart(2, '0')
  return `${p(d.getUTCDate())}${p(d.getUTCHours())}${p(d.getUTCMinutes())}Z${MONTHS[d.getUTCMonth()]}${String(d.getUTCFullYear()).slice(2)}`
}

/** One post, styled as a classified situation report. */
export function SitRep({ item, number, path }: { item: ContentItem; number: number; path?: string }) {
  const src = useSignedUrl(path)
  const [nvg, setNvg] = useState(true)
  const [declassified, setDeclassified] = useState(false)
  const stamp = item.unlock_at && new Date(item.unlock_at) > new Date(item.created_at) ? item.unlock_at : item.created_at

  return (
    <motion.article
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      className="ops-panel brackets overflow-hidden"
    >
      <header className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b border-[#5b6b3a]/50 bg-black/40 px-4 py-2 text-[0.6rem] tracking-[0.2em] text-[#c2a878] uppercase">
        <span>SITREP #{String(number).padStart(3, '0')}</span>
        <span>DTG {dtg(stamp)}</span>
        <span className="text-[#d7262b]">Top secret // her eyes only</span>
      </header>

      {src && (
        <div className="relative">
          <img src={src} alt={item.title} loading="lazy" className={`aspect-[4/3] w-full object-cover transition ${nvg ? 'nvg-photo' : ''}`} />
          <span aria-hidden className="pointer-events-none absolute inset-0 grid place-items-center">
            <span className="relative block h-14 w-14 rounded-full border border-[#8dff5a]/60">
              <span className="absolute top-1/2 left-1/2 h-px w-24 -translate-x-1/2 bg-[#8dff5a]/40" />
              <span className="absolute top-1/2 left-1/2 h-24 w-px -translate-y-1/2 bg-[#8dff5a]/40" />
            </span>
          </span>
          <button
            onClick={() => setNvg((v) => !v)}
            aria-pressed={nvg}
            className="absolute top-3 right-3 border border-[#8dff5a]/60 bg-black/60 px-2 py-1 text-[0.6rem] tracking-[0.2em] text-[#8dff5a] uppercase"
          >
            NVG {nvg ? 'ON' : 'OFF'}
          </button>
        </div>
      )}

      <div className="relative px-5 pt-5 pb-6">
        <span className="classified-stamp absolute top-4 right-4 rotate-[8deg] text-xs">Classified</span>
        <h2 className="stencil pr-24 text-2xl leading-tight text-[#e9e2cf] uppercase">{item.title}</h2>
        {(item.caption || item.body.text) && <p className="mt-3 text-sm leading-relaxed whitespace-pre-line text-[#d6d1bf]">{item.body.text ?? item.caption}</p>}
        {item.body.text && item.caption && <p className="mt-2 text-sm text-[#c2a878]">— {item.caption}</p>}

        {item.hidden_message && (
          <button
            onClick={() => setDeclassified(true)}
            disabled={declassified}
            className="mt-4 block text-left text-sm leading-relaxed"
            aria-label={declassified ? undefined : 'Redacted line — tap to declassify'}
          >
            {declassified ? (
              <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="nvg-text">
                [DECLASSIFIED] {item.hidden_message}
              </motion.span>
            ) : (
              <>
                <span className="redacted">{item.hidden_message}</span>
                <span className="mt-1 block text-[0.6rem] tracking-[0.25em] text-[#c2a878]/70 uppercase">▸ tap to declassify</span>
              </>
            )}
          </button>
        )}
      </div>
    </motion.article>
  )
}
