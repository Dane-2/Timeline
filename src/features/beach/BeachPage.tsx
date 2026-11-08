import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import '@fontsource/pacifico/400.css'
import './beach.css'
import type { ContentItem } from '../../types/content'
import { useAuth } from '../auth/authContext'
import { useRoomContent } from '../rooms/useRoomContent'
import { BeachBackdrop } from './BeachBackdrop'
import { Postcard } from './Postcard'
import { Surfboards } from './Surfboards'
import { BeachLightbox } from './BeachLightbox'
import { OceanSound } from './oceanSound'

const vibes = [
  ['Swell', 'just right'],
  ['Water', 'brisk, honestly'],
  ['Sunscreen', 'reapplied'],
  ['Vibes', 'immaculate'],
]

/** Southern California at golden hour. Shows open content whose theme is 'beach'. */
export default function BeachPage() {
  const { role } = useAuth()
  const { items, withPhotos, textOnly, pathFor, loading } = useRoomContent('beach')
  const [open, setOpen] = useState<ContentItem | null>(null)

  const ocean = useRef<OceanSound | null>(null)
  const [waves, setWaves] = useState(false)
  useEffect(() => () => ocean.current?.dispose(), [])
  const toggleWaves = useCallback(async () => {
    ocean.current ??= new OceanSound()
    if (waves) {
      ocean.current.stop()
      setWaves(false)
    } else {
      await ocean.current.start()
      setWaves(true)
    }
  }, [waves])

  return (
    <div className="beach-root relative min-h-[80dvh] pb-16">
      <BeachBackdrop />

      <header className="pt-8 pb-10 text-center sm:pt-14">
        <p className="text-[0.7rem] font-bold tracking-[0.45em] text-[#0f4c5c]/80 uppercase">Greetings from</p>
        <motion.h1
          initial={{ opacity: 0, y: 16, rotate: -4 }}
          animate={{ opacity: 1, y: 0, rotate: -4 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="retro-title mt-2 text-[3.4rem] leading-[1.1] sm:text-7xl"
        >
          Golden Hour
        </motion.h1>
        <div className="mt-4 flex items-center justify-center gap-3">
          <RouteShield />
          <p className="text-xs font-bold tracking-[0.35em] text-[#0f4c5c] uppercase">Southern California</p>
        </div>

        <ul className="mx-auto mt-7 flex max-w-md flex-wrap justify-center gap-2">
          {vibes.map(([k, v]) => (
            <li key={k} className="rounded-full bg-white/70 px-3 py-1 text-xs text-[#0f4c5c] backdrop-blur-sm">
              <span className="font-bold">{k}:</span> {v}
            </li>
          ))}
        </ul>

        <button
          onClick={toggleWaves}
          aria-pressed={waves}
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-[#0f4c5c] px-5 py-2.5 text-sm font-semibold text-white shadow-[0_10px_24px_-12px_#0f4c5c] transition hover:bg-[#145f80]"
        >
          <span aria-hidden>{waves ? '❚❚' : '〰'}</span>
          {waves ? 'Quiet the waves' : 'Hear the waves'}
        </button>
      </header>

      <div className="space-y-16">
        {withPhotos.length > 0 && (
          <section aria-label="Postcards">
            <h2 className="beach-script mb-6 text-center text-3xl text-[#0f4c5c]">postcards</h2>
            <ul className="grid gap-7 sm:grid-cols-2">
              {withPhotos.map((item, i) => (
                <Postcard key={item.id} item={item} path={pathFor(item.id)} index={i} />
              ))}
            </ul>
          </section>
        )}
        <Surfboards items={textOnly} onOpen={setOpen} />

        {!loading && items.length === 0 && (
          <div className="beach-card mx-auto max-w-xs rounded-2xl px-6 py-7 text-center">
            <p className="beach-script text-2xl text-[#0f4c5c]">nothing's washed up yet</p>
            <p className="text-ink-soft mt-2 text-sm">Check back soon — the tide brings things in.</p>
            {role === 'admin' && (
              <p className="mt-3 text-xs text-[#ff6f91]">(only you can see this) add memories with theme “beach”.</p>
            )}
          </div>
        )}
      </div>

      <AnimatePresence>{open && <BeachLightbox item={open} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  )
}

/** A California-style route shield, drawn from scratch. */
function RouteShield() {
  return (
    <svg aria-hidden viewBox="0 0 40 44" className="h-9 w-8">
      <path d="M4 4h32c0 6 2 9 2 14 0 14-10 20-18 24C12 38 2 32 2 18c0-5 2-8 2-14Z" fill="#1f6b43" stroke="#fff" strokeWidth="2" />
      <text x="20" y="13" textAnchor="middle" fontSize="5.5" fontWeight="700" fill="#fff" fontFamily="DM Sans Variable, sans-serif">CALIFORNIA</text>
      <text x="20" y="33" textAnchor="middle" fontSize="18" fontWeight="800" fill="#fff" fontFamily="DM Sans Variable, sans-serif">1</text>
    </svg>
  )
}
