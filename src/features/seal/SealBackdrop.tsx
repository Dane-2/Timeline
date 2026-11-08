import { createPortal } from 'react-dom'
import { usePageChrome } from '../../hooks/usePageChrome'

const blips = [
  { right: '22vmin', bottom: '30vmin', delay: '-0.6s' },
  { right: '8vmin', bottom: '14vmin', delay: '-2.1s' },
  { right: '30vmin', bottom: '8vmin', delay: '-3.2s' },
]

/** Tactical map grid, topo contours, a sweeping radar, NVG scanlines and vignette. */
export function SealBackdrop() {
  usePageChrome('#070907')
  return createPortal(
    <div aria-hidden className="seal-root seal-backdrop">
      <div className="seal-grid" />
      <Topo />
      <div className="seal-radar" />
      {blips.map((b) => (
        <span key={b.right} className="seal-blip" style={{ right: b.right, bottom: b.bottom, ['--delay' as string]: b.delay }} />
      ))}
      <div className="seal-scan" />
      <div className="seal-scanline" />
      <div className="seal-vignette" />
    </div>,
    document.body,
  )
}

/** Hand-placed contour rings so it reads like a topographic map. */
function Topo() {
  const rings = (cx: number, cy: number, n: number, wobble: number) =>
    Array.from({ length: n }, (_, i) => {
      const r = 30 + i * 26
      const pts = Array.from({ length: 13 }, (_, k) => {
        const a = (k / 12) * Math.PI * 2
        const rr = r + Math.sin(a * 3 + i) * wobble + Math.cos(a * 2 - i) * wobble * 0.6
        return `${(cx + Math.cos(a) * rr).toFixed(1)},${(cy + Math.sin(a) * rr * 0.75).toFixed(1)}`
      })
      return <polygon key={`${cx}-${i}`} points={pts.join(' ')} />
    })
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice">
      <g fill="none" stroke="rgb(194 168 120 / .12)" strokeWidth="1.2" strokeLinejoin="round">
        {rings(220, 260, 9, 14)}
        {rings(780, 640, 8, 18)}
      </g>
    </svg>
  )
}
