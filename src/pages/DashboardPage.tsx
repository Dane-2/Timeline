import { useCallback, type ReactNode } from 'react'
import { motion } from 'motion/react'
import { useAsync } from '../hooks/useAsync'
import { fetchLockedPreviews, fetchOpenContent } from '../features/content/api'
import { useSiteSettings } from '../features/content/SiteSettingsContext'
import { FeaturedMemory } from '../features/dashboard/FeaturedMemory'
import { UpcomingSurprises } from '../features/dashboard/UpcomingSurprises'
import { NoteWallPreview } from '../features/dashboard/NoteWallPreview'
import { TimelinePreview } from '../features/dashboard/TimelinePreview'
import { SurpriseMe } from '../features/dashboard/SurpriseMe'
import { PaperLoader } from '../components/scrapbook/PaperLoader'
import { WashiTape } from '../components/scrapbook/WashiTape'
import { Pushpin } from '../components/scrapbook/Pushpin'
import { useCalmMode } from '../hooks/useCalmMode'
import { useAuth } from '../features/auth/authContext'
import { Link } from 'react-router-dom'

export function DashboardPage() {
  const settings = useSiteSettings()
  const { session, role, signOut } = useAuth()
  const { calm, toggle } = useCalmMode()
  const open = useAsync(() => fetchOpenContent(), [])
  const locked = useAsync(fetchLockedPreviews, [])

  const { reload: reloadOpen } = open
  const { reload: reloadLocked } = locked
  const refresh = useCallback(() => {
    reloadOpen()
    reloadLocked()
  }, [reloadOpen, reloadLocked])

  if (open.loading && !open.data) return <PaperLoader />
  if (open.error) return <ErrorNote onRetry={refresh} />

  const items = open.data ?? []
  const previews = locked.data ?? []
  const ofKind = (k: string) => items.filter((i) => i.kind === k)
  const today = new Date().toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })

  return (
    <div className="space-y-10 md:space-y-12">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="stamp text-mauve">{today}</p>
          <h1 className="font-display mt-1 text-3xl font-semibold tracking-tight md:text-4xl">
            {settings.herName ? <>Hi, {settings.herName}.</> : <>Hi, you.</>}
          </h1>
          <p className="hand text-ink-soft text-xl">your little corner — make yourself at home.</p>
        </div>
      </header>

      <div className="grid gap-10 md:grid-cols-[1fr_1.15fr] md:gap-12">
        <Card rotate={-0.6} tape="dots">
          <FeaturedMemory items={items} />
        </Card>
        <Card rotate={0.5} pin>
          <UpcomingSurprises previews={previews} onSomethingUnlocked={refresh} />
        </Card>
      </div>

      <div className="grid gap-10 md:grid-cols-[1.1fr_1fr] md:gap-12">
        <Card rotate={0.4} tape="pink">
          <NoteWallPreview notes={ofKind('sticky_note')} />
        </Card>
        <Card rotate={-0.5}>
          <TimelinePreview entries={ofKind('timeline')} locked={previews} />
        </Card>
      </div>

      <SurpriseMe items={items} />

      <footer className="text-ink-soft flex flex-wrap items-center justify-center gap-x-5 gap-y-2 pt-4 text-sm">
        <button onClick={toggle} aria-pressed={calm} className="underline-offset-4 hover:underline">
          {calm ? 'Turn animations back on' : 'Less motion, please'}
        </button>
        {role === 'admin' && (
          <Link to="/admin" className="underline-offset-4 hover:underline">
            Admin
          </Link>
        )}
        {session && (
          <button onClick={signOut} className="underline-offset-4 hover:underline">
            Sign out
          </button>
        )}
      </footer>
    </div>
  )
}

function Card({ children, rotate = 0, tape, pin }: { children: ReactNode; rotate?: number; tape?: 'pink' | 'dots' | 'lavender'; pin?: boolean }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-40px' }}
      transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
      className="paper relative rounded-sm p-5 md:p-6"
      style={{ rotate: `${rotate}deg` }}
    >
      {tape && <WashiTape variant={tape} className="-top-3 left-8" rotate={-5} />}
      {pin && <Pushpin className="-top-3 left-1/2 -translate-x-1/2" color="lavender" />}
      {children}
    </motion.div>
  )
}

function ErrorNote({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="paper mx-auto mt-10 max-w-sm -rotate-1 p-6 text-center">
      <p className="hand text-mauve text-2xl">the internet hiccuped.</p>
      <p className="text-ink-soft mt-2 text-sm">Nothing's lost. Try again in a moment.</p>
      <button onClick={onRetry} className="bg-mauve text-cream mt-4 rounded-full px-5 py-2 font-semibold">
        Try again
      </button>
    </div>
  )
}
