import { createPortal } from 'react-dom'
import { usePageChrome } from '../../hooks/usePageChrome'

const cones = [
  { a: -22, color: '#ff2bd6', left: '22%', dur: '6.6s' },
  { a: 0, color: '#8a4dff', left: '50%', dur: '8.2s' },
  { a: 22, color: '#00f0ff', left: '78%', dur: '7.4s' },
]

const smoke = [
  { left: '-10%', bottom: '-10%', size: '70vmax', dur: '24s', delay: '0s' },
  { left: '35%', bottom: '-20%', size: '80vmax', dur: '30s', delay: '-9s' },
  { left: '60%', bottom: '-5%', size: '60vmax', dur: '27s', delay: '-17s' },
  { left: '5%', bottom: '10%', size: '55vmax', dur: '33s', delay: '-22s' },
]

const beams = [
  { a: -38, color: 'var(--neon-pink)', left: '18%', dur: '5.2s' },
  { a: -12, color: 'var(--neon-cyan)', left: '38%', dur: '6.4s' },
  { a: 14, color: 'var(--neon-lime)', left: '62%', dur: '5.8s' },
  { a: 36, color: 'var(--neon-violet)', left: '82%', dur: '7s' },
]

/**
 * Full-screen club: smoke, moving-head spotlights, lasers, a light wash on the
 * beat and a moving grid floor. Portaled to <body> so it covers the whole
 * viewport, and it darkens the browser chrome while you're here.
 *
 * `syncKey` restarts the beat animations so they line up with the music.
 */
export function RaveBackdrop({ syncKey = 0, lightsOn = true }: { syncKey?: number; lightsOn?: boolean }) {
  usePageChrome('#06030c')

  return createPortal(
    <div aria-hidden className={`rave-root rave-backdrop ${lightsOn ? '' : 'lights-off'}`}>
      <div className="rave-blob" style={{ background: 'radial-gradient(circle, #ff2bd6, transparent 62%)', top: '-25%', left: '-25%' }} />
      <div
        className="rave-blob"
        style={{ background: 'radial-gradient(circle, #00f0ff, transparent 62%)', bottom: '-30%', right: '-30%', animationDelay: '-7s' }}
      />
      <div className="rave-blob" style={{ background: 'radial-gradient(circle, #8a4dff, transparent 62%)', top: '20%', left: '30%', animationDelay: '-3s' }} />
      <div className="rave-haze" />
      {smoke.map((p) => (
        <div
          key={p.left + p.dur}
          className="rave-smoke"
          style={{ left: p.left, bottom: p.bottom, width: p.size, height: p.size, ['--dur' as string]: p.dur, ['--delay' as string]: p.delay }}
        />
      ))}
      {cones.map((c) => (
        <span
          key={c.left}
          className="rave-cone"
          style={{
            left: c.left,
            ['--a' as string]: `${c.a}deg`,
            ['--dur' as string]: c.dur,
            background: `linear-gradient(to bottom, ${c.color}, transparent 80%)`,
          }}
        />
      ))}
      {beams.map((b) => (
        <span
          key={b.left}
          className="rave-beam"
          style={{
            left: b.left,
            ['--a' as string]: `${b.a}deg`,
            ['--dur' as string]: b.dur,
            background: `linear-gradient(to bottom, ${b.color}, transparent 75%)`,
            boxShadow: `0 0 12px ${b.color}`,
          }}
        />
      ))}
      <div key={`wash-${syncKey}`} className="rave-wash" />
      <div key={`grid-${syncKey}`} className="rave-grid" />
      <div className="rave-scanlines" />
    </div>,
    document.body,
  )
}
