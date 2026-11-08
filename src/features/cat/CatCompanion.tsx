import { useEffect, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useAsync } from '../../hooks/useAsync'
import { fetchOpenContent } from '../content/api'
import { SittingCat, type CatOutfit } from './SittingCat'

// Used only until real cat messages are added in the admin.
const fallbackLines = ['mrrp.', '*stretches dramatically*', 'have you had water today?', 'i was told to keep an eye on you.']
const roomLines: Record<CatOutfit, string[]> = {
  rave: ['unce unce unce', '*puts on sunglasses*', 'no sleep till sunrise.', 'hydrate between sets.'],
  beach: ['is it sunset yet?', '*steals your spot on the towel*', 'sunscreen. now.', 'the ocean is just a very big water bowl.'],
  seal: ['hooyah.', '*low crawls across the screen*', 'embrace the suck.', 'cat team six, reporting for duty.'],
}
const roomFor: Record<string, CatOutfit> = { '/rave': 'rave', '/beach': 'beach', '/seal': 'seal' }

const HIDE_KEY = 'little-piece:cat-hidden'

/**
 * A small cat who sits in the corner and says things when tapped.
 * Lines come from `cat_message` content (RLS-filtered like everything else).
 */
export function CatCompanion() {
  const { data } = useAsync(() => fetchOpenContent(['cat_message']), [])
  // In a themed room the cat dresses up and uses lines whose placement is that room.
  const room = roomFor[useLocation().pathname] as CatOutfit | undefined
  const pool = (data ?? []).filter((m) => (m.placement ?? undefined) === room || (!room && !m.placement)).map((m) => m.title).filter(Boolean)
  const lines = pool.length ? pool : room ? roomLines[room] : fallbackLines
  const [bubble, setBubble] = useState<string | null>(null)
  const [hidden, setHidden] = useState(() => {
    try {
      return sessionStorage.getItem(HIDE_KEY) === 'true'
    } catch {
      return false
    }
  })

  useEffect(() => {
    if (!bubble) return
    const id = window.setTimeout(() => setBubble(null), 5000)
    return () => window.clearTimeout(id)
  }, [bubble])

  function talk() {
    const options = lines.filter((l) => l !== bubble)
    setBubble(options[Math.floor(Math.random() * options.length)] ?? lines[0])
  }

  function hide() {
    setHidden(true)
    try {
      sessionStorage.setItem(HIDE_KEY, 'true')
    } catch {
      /* ignore */
    }
  }

  if (hidden) return null

  return (
    <div className="pointer-events-none fixed right-3 bottom-[calc(5.25rem+env(safe-area-inset-bottom))] z-30 flex flex-col items-end md:right-6 md:bottom-6">
      <AnimatePresence>
        {bubble && (
          <motion.div
            role="status"
            initial={{ opacity: 0, y: 8, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.95 }}
            className="paper hand pointer-events-auto relative mb-2 max-w-[13rem] rounded-2xl px-4 py-2 text-lg"
          >
            {bubble}
            <button onClick={hide} className="stamp text-ink-soft mt-1 block text-[0.6rem] hover:underline">
              shoo for now
            </button>
            <span aria-hidden className="bg-paper absolute -bottom-1.5 right-8 h-3 w-3 rotate-45" />
          </motion.div>
        )}
      </AnimatePresence>
      <button onClick={talk} aria-label="Pet the cat" className="pointer-events-auto transition-transform active:scale-95">
        <span className="block" style={room === 'rave' ? { animation: 'cat-bob 0.469s ease-in-out infinite' } : undefined}>
          <SittingCat outfit={room} />
        </span>
      </button>
    </div>
  )
}
