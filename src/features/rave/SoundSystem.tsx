import { motion } from 'motion/react'

interface Props {
  playing: boolean
  onToggle: () => void
  lightsOn: boolean
  onToggleLights: () => void
}

/** Play/stop the house mix, and a switch for the flashing lights. */
export function SoundSystem({ playing, onToggle, lightsOn, onToggleLights }: Props) {
  return (
    <div className="flex flex-col items-center gap-3">
      <motion.button
        onClick={onToggle}
        aria-pressed={playing}
        whileTap={{ scale: 0.94 }}
        className={`rave-display flex items-center gap-3 rounded-full border-2 px-7 py-3.5 text-sm font-black tracking-[0.18em] uppercase transition ${
          playing
            ? 'border-[#ff2bd6] bg-[#ff2bd6] text-black shadow-[0_0_30px_-2px_#ff2bd6]'
            : 'border-[#ff2bd6] text-white shadow-[0_0_22px_-6px_#ff2bd6] hover:bg-[#ff2bd6]/15'
        }`}
      >
        <span aria-hidden className="flex h-4 items-end gap-[3px]">
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              className="w-[3px] rounded-sm bg-current"
              style={{
                height: playing ? undefined : `${[40, 75, 55, 90][i]}%`,
                animation: playing ? `eq-bar 0.469s ease-in-out ${i * -0.12}s infinite alternate` : undefined,
              }}
            />
          ))}
        </span>
        {playing ? 'Stop the music' : 'Play the house mix'}
      </motion.button>
      <button onClick={onToggleLights} aria-pressed={!lightsOn} className="font-mono text-[0.65rem] tracking-[0.25em] text-white/55 uppercase hover:text-white">
        {lightsOn ? 'too much? chill the lights' : 'lights back on'}
      </button>
    </div>
  )
}
