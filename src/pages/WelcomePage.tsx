import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'motion/react'
import { useAuth } from '../features/auth/authContext'
import { SignInCard } from '../features/auth/SignInCard'
import { useSiteSettings } from '../features/content/SiteSettingsContext'
import { Cloud } from '../components/scrapbook/Clouds'
import { Heart, Sparkle } from '../components/scrapbook/Doodles'
import { SittingCat } from '../features/cat/SittingCat'

/**
 * The front cover: a soft pink sky, a centered title, and the cat on a cloud.
 * Logged-out visitors only ever see generic text here; the personalized
 * title/subtitle come from site_settings, which needs a member.
 */
export function WelcomePage() {
  const { session, role } = useAuth()
  const settings = useSiteSettings()
  const navigate = useNavigate()
  const location = useLocation()
  const [showSignIn, setShowSignIn] = useState(false)
  const from = (location.state as { from?: string } | null)?.from ?? '/home'

  const isMember = Boolean(session && role)

  // After signing in from the card, go straight inside.
  useEffect(() => {
    if (showSignIn && isMember) navigate(from, { replace: true })
  }, [showSignIn, isMember, from, navigate])

  function enter() {
    if (isMember) navigate(from)
    else setShowSignIn(true)
  }

  return (
    <main
      className="relative flex min-h-dvh flex-col overflow-hidden"
      style={{ background: 'linear-gradient(to bottom, #ffe4ee 0%, #fff4f8 38%, #ffffff 72%)' }}
    >
      <Sky />

      <section className="relative z-10 flex flex-1 flex-col items-center justify-center px-6 pt-20 pb-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center"
        >
          <Heart className="text-blush-deep h-6 w-6" />
          {isMember && settings.herName && <p className="hand text-mauve mt-3 text-2xl">hi, {settings.herName}</p>}
          <h1 className="font-display text-ink mt-3 text-[2.5rem] leading-[1.05] font-medium tracking-tight text-balance sm:text-6xl">
            {settings.siteTitle}
          </h1>
          <div aria-hidden className="mt-5 flex items-center gap-3">
            <span className="bg-blush h-px w-10" />
            <Sparkle className="text-blush-deep h-3.5 w-3.5" />
            <span className="bg-blush h-px w-10" />
          </div>
          <p className="text-ink-soft mt-5 max-w-[19rem] text-[1.05rem] leading-relaxed">{settings.siteSubtitle}</p>
        </motion.div>

        <div className="mt-9 flex w-full justify-center">
          <AnimatePresence mode="wait">
            {showSignIn && !isMember ? (
              <motion.div
                key="signin"
                className="w-full"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
              >
                <SignInCard onCancel={() => setShowSignIn(false)} />
              </motion.div>
            ) : (
              <motion.button
                key="enter"
                onClick={enter}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.96 }}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                className="bg-mauve text-cream hover:bg-ink rounded-full px-9 py-3.5 text-lg font-medium shadow-[0_10px_24px_-12px_rgb(140_97_120_/_0.7)] transition-colors"
              >
                {settings.enterLabel}
              </motion.button>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* The cat, napping on a cloud at the bottom of the page */}
      <div aria-hidden className="relative z-0 mx-auto -mb-6 w-[19rem] max-w-[90vw] shrink-0">
        <motion.div
          className="absolute bottom-[58%] left-1/2 -translate-x-1/2"
          whileTap={{ rotate: [0, -6, 6, 0] }}
        >
          <SittingCat className="h-20 w-[5.5rem]" />
        </motion.div>
        <Cloud className="w-full" drift={0} />
      </div>
    </main>
  )
}

/** Mirrored pairs of drifting clouds, so the page stays balanced. */
function Sky() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0">
      <Cloud className="absolute top-[4%] -left-10 w-48 opacity-90 sm:left-[6%] sm:w-64" drift={16} />
      <Cloud className="absolute top-[4%] -right-10 w-48 opacity-90 sm:right-[6%] sm:w-64" flip drift={16} delay={8} />
      <Cloud className="absolute top-[17%] left-[12%] w-20 opacity-70 sm:left-[22%] sm:w-28" drift={12} delay={3} />
      <Cloud className="absolute top-[17%] right-[12%] w-20 opacity-70 sm:right-[22%] sm:w-28" flip drift={12} delay={9} />
      <Cloud className="absolute top-[46%] left-[3%] hidden w-44 opacity-60 sm:block" drift={18} delay={5} />
      <Cloud className="absolute top-[46%] right-[3%] hidden w-44 opacity-60 sm:block" flip drift={18} delay={14} />
      <Sparkle className="text-blush absolute top-[11%] left-1/2 h-4 w-4 -translate-x-1/2" />
    </div>
  )
}
