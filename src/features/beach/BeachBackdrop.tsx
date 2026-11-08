import type { CSSProperties } from 'react'
import { createPortal } from 'react-dom'
import { usePageChrome } from '../../hooks/usePageChrome'

const wave = (y: number, amp: number) => {
  // One seamless wave tile 720 wide, drawn twice so the loop never shows a seam.
  let d = `M0 ${y}`
  for (let x = 0; x < 1440; x += 180) d += ` q45 ${-amp} 90 0 t90 0`
  return `${d} V120 H0 Z`
}

const gulls = [
  { top: '14%', dur: '34s', delay: '-4s', size: 22 },
  { top: '20%', dur: '41s', delay: '-19s', size: 16 },
  { top: '9%', dur: '38s', delay: '-27s', size: 13 },
]

/** Golden-hour sky, retro striped sun, rolling ocean, palms and gulls. */
export function BeachBackdrop() {
  usePageChrome('#8fd3f4')
  return createPortal(
    <div aria-hidden className="beach-root beach-backdrop">
      <div className="beach-sun" />
      <div className="beach-ocean" />
      <div className="beach-glitter" />
      {[
        { bottom: '26%', color: '#2a9bc0', dur: '22s', amp: 10, op: 0.9 },
        { bottom: '14%', color: '#1d7ea3', dur: '16s', amp: 14, op: 0.95 },
        { bottom: '3%', color: '#145f80', dur: '11s', amp: 18, op: 1 },
      ].map((w) => (
        <svg
          key={w.bottom}
          className="beach-wave"
          style={{ bottom: w.bottom, ['--dur' as string]: w.dur, opacity: w.op }}
          viewBox="0 0 1440 120"
          preserveAspectRatio="none"
          height="90"
        >
          <path d={wave(40, w.amp)} fill={w.color} />
          <path d={wave(40, w.amp)} fill="none" stroke="rgb(255 255 255 / .55)" strokeWidth="2.5" />
        </svg>
      ))}
      {/* Sand */}
      <div className="absolute inset-x-0 bottom-0 h-[5%]" style={{ background: 'linear-gradient(#f3dfc1, #e8cfa6)' }} />
      <Palm className="beach-palm" style={{ left: '-14vh' }} />
      <Palm className="beach-palm" style={{ right: '-14vh', ['--flip' as string]: -1, animationDelay: '-3s' }} />
      {gulls.map((g) => (
        <svg
          key={g.top}
          className="beach-gull"
          style={{ top: g.top, ['--dur' as string]: g.dur, ['--delay' as string]: g.delay }}
          width={g.size}
          height={g.size / 2}
          viewBox="0 0 24 12"
        >
          <path d="M1 8c4-5 7-5 11 0 4-5 7-5 11 0" fill="none" stroke="#3a2b45" strokeWidth="2" strokeLinecap="round" />
        </svg>
      ))}
    </div>,
    document.body,
  )
}

function Palm({ className, style }: { className: string; style: CSSProperties }) {
  const leaf = 'M0 0C-28-34-74-40-112-14-76-26-38-20 0 0Z'
  return (
    <svg className={className} style={style} viewBox="0 0 200 420" preserveAspectRatio="xMidYMax meet">
      <path d="M96 420C92 330 88 250 118 150" stroke="#3a2b45" strokeWidth="13" fill="none" strokeLinecap="round" />
      <path d="M93 400l8-4M92 360l9-4M92 320l10-4M94 280l10-4M98 240l10-4M104 200l10-3" stroke="#2a1f33" strokeWidth="3" />
      <g transform="translate(118 150)" fill="#3a2b45">
        {[-10, 18, 52, 128, 160, 196].map((r) => (
          <path key={r} d={leaf} transform={`rotate(${r}) scale(${r > 90 && r < 170 ? 0.85 : 1})`} />
        ))}
        <circle r="8" cx="-4" cy="6" fill="#2a1f33" />
        <circle r="7" cx="7" cy="9" fill="#2a1f33" />
      </g>
    </svg>
  )
}
