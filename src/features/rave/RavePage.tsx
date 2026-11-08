import { useCallback, useEffect, useRef, useState } from 'react'
import { AnimatePresence } from 'motion/react'
import '@fontsource-variable/unbounded'
import './rave.css'
import type { ContentItem } from '../../types/content'
import { useRoomContent } from '../rooms/useRoomContent'
import { useAuth } from '../auth/authContext'
import { RaveBackdrop } from './RaveBackdrop'
import { DropIntro } from './DropIntro'
import { Lineup } from './Lineup'
import { NeonGallery } from './NeonGallery'
import { Wristbands } from './Wristbands'
import { DropButton } from './DropButton'
import { RaveLightbox } from './RaveLightbox'
import { SoundSystem } from './SoundSystem'
import { ClubClock } from './ClubClock'
import { HouseEngine } from './houseEngine'
import { useCalmMode } from '../../hooks/useCalmMode'

/**
 * The rave room: looks like just another bookmark tab from outside, then the
 * whole site flips to neon. Shows any open content whose theme is 'rave'.
 */
export default function RavePage() {
  const { role } = useAuth()
  const { items, withPhotos, textOnly, pathFor, signedSrcFor, loading } = useRoomContent('rave')
  const [open, setOpen] = useState<{ item: ContentItem; src: string | null } | null>(null)

  // Sound system: an original house groove synthesized in the browser.
  const engine = useRef<HouseEngine | null>(null)
  const [playing, setPlaying] = useState(false)
  const [syncKey, setSyncKey] = useState(0)
  const { calm } = useCalmMode()
  const [lightsOn, setLightsOn] = useState(!calm)

  useEffect(() => () => engine.current?.dispose(), [])

  const toggleMusic = useCallback(async () => {
    engine.current ??= new HouseEngine()
    if (engine.current.playing) {
      engine.current.stop()
      setPlaying(false)
      return
    }
    await engine.current.start()
    setPlaying(true)
    // Restart the light animations on the first kick so they pulse with the music.
    window.setTimeout(() => setSyncKey((k) => k + 1), 80)
  }, [])

  const openItem = useCallback(
    async (item: ContentItem, src?: string | null) => setOpen({ item, src: src ?? (await signedSrcFor(item)) }),
    [signedSrcFor],
  )

  return (
    <div className="rave-root relative -mx-4 min-h-[80dvh] px-4 pb-16 text-white md:-mx-6 md:px-6">
      <RaveBackdrop syncKey={syncKey} lightsOn={lightsOn} />
      <DropIntro />

      <header className="pt-10 pb-14 text-center sm:pt-16">
        <p className="rave-flicker font-mono text-[0.7rem] tracking-[0.5em] text-[#c6ff3d] uppercase">doors open late · no sleep</p>
        <h1 className="rave-display neon-pink chroma on-beat mt-4 text-[4.2rem] leading-none font-black uppercase sm:text-8xl">Rave</h1>
        <p className="mt-5 font-mono text-xs tracking-[0.35em] text-white/70 uppercase">the loud part of us</p>
        <div className="mt-4">
          <ClubClock />
        </div>
        <div className="mt-9">
          <SoundSystem
            playing={playing}
            onToggle={toggleMusic}
            lightsOn={lightsOn}
            onToggleLights={() => setLightsOn((on) => !on)}
          />
        </div>
      </header>

      <div className="space-y-20">
        {!loading && <Lineup items={items} onOpen={(item) => openItem(item)} />}
        <NeonGallery items={withPhotos} pathFor={pathFor} onOpen={(item, src) => openItem(item, src)} />
        <Wristbands items={textOnly} onOpen={(item) => openItem(item)} />
        {!loading && items.length === 0 && role === 'admin' && (
          <p className="mx-auto max-w-sm text-center font-mono text-xs leading-relaxed text-white/50">
            (only you can see this) add memories with theme <span className="text-[#c6ff3d]">rave</span> and they'll show up on the lineup.
          </p>
        )}
        <DropButton onDrop={() => engine.current?.drop()} />
      </div>

      <AnimatePresence>{open && <RaveLightbox item={open.item} src={open.src} onClose={() => setOpen(null)} />}</AnimatePresence>
    </div>
  )
}
