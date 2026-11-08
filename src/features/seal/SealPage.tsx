import { motion } from 'motion/react'
import '@fontsource/black-ops-one/400.css'
import './seal.css'
import { useAuth } from '../auth/authContext'
import { useSiteSettings } from '../content/SiteSettingsContext'
import { useRoomContent } from '../rooms/useRoomContent'
import { SealBackdrop } from './SealBackdrop'
import { BootSequence } from './BootSequence'
import { MissionClock } from './MissionClock'
import { SitRep } from './SitRep'
import { Trident } from './Trident'

/**
 * The operator log: your posts from training, styled as classified SITREPs.
 * Shows open content whose theme is 'seal' — schedule posts ahead with unlock dates.
 */
export default function SealPage() {
  const { role } = useAuth()
  const settings = useSiteSettings()
  const { items, pathFor, loading } = useRoomContent('seal')
  // Newest first, numbered in the order they were posted.
  const posts = [...items].sort((a, b) => (b.unlock_at ?? b.created_at).localeCompare(a.unlock_at ?? a.created_at))
  const clearance = settings.herName ? `${settings.herName.toUpperCase()} — PRIORITY ONE` : 'PRIORITY ONE'

  return (
    <div className="seal-root relative min-h-[80dvh] pb-16 text-[#e9e2cf]">
      <SealBackdrop />
      <BootSequence clearance={clearance} />

      <header className="pt-8 pb-10 text-center sm:pt-14">
        <motion.div initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.6 }}>
          <Trident className="mx-auto h-20 w-20 text-[#c2a878]" />
        </motion.div>
        <p className="mt-4 text-[0.65rem] tracking-[0.5em] text-[#d7262b] uppercase">// Classified · eyes only //</p>
        <h1 className="stencil mt-3 text-[2.9rem] leading-none text-[#e9e2cf] uppercase sm:text-7xl">Operator Log</h1>
        <p className="mt-4 text-[0.7rem] tracking-[0.35em] text-[#c2a878] uppercase">The only easy day was yesterday</p>
        <div className="mt-8">
          <MissionClock departureDate={settings.departureDate} />
        </div>
      </header>

      {posts.length > 0 ? (
        <div className="mx-auto max-w-xl space-y-10">
          {posts.map((item, i) => (
            <SitRep key={item.id} item={item} number={posts.length - i} path={pathFor(item.id)} />
          ))}
        </div>
      ) : (
        !loading && (
          <div className="ops-panel brackets mx-auto max-w-sm px-6 py-8 text-center">
            <p className="stencil text-xl text-[#e9e2cf] uppercase">No traffic on this channel</p>
            <p className="nvg-text blink-cursor mt-3 text-xs tracking-[0.25em] uppercase">Stand by</p>
            {role === 'admin' && (
              <p className="mt-5 text-[0.65rem] leading-relaxed text-[#c2a878]/80">
                (only you can see this) post with theme “seal”. Give a post an unlock date to have it drop while you're gone.
              </p>
            )}
          </div>
        )
      )}
    </div>
  )
}
