import { Outlet, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { ScrapbookTabs } from './ScrapbookTabs'
import { CatCompanion } from '../../features/cat/CatCompanion'

export function AppShell() {
  const location = useLocation()
  return (
    <div className="min-h-dvh pb-24 md:pb-10">
      <ScrapbookTabs />
      <AnimatePresence mode="wait">
        <motion.main
          key={location.pathname}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          className="mx-auto max-w-5xl px-4 pt-6 md:px-6 md:pt-8"
        >
          <Outlet />
        </motion.main>
      </AnimatePresence>
      <CatCompanion />
    </div>
  )
}
