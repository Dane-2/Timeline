import type { CSSProperties } from 'react'

const patterns = {
  pink: 'repeating-linear-gradient(45deg, rgb(246 184 206 / .85) 0 6px, rgb(255 220 232 / .85) 6px 12px)',
  lavender: 'repeating-linear-gradient(90deg, rgb(181 154 216 / .7) 0 4px, rgb(230 220 245 / .75) 4px 10px)',
  dots: 'radial-gradient(circle at 4px 4px, rgb(140 97 120 / .45) 1.5px, transparent 2px) 0 0 / 9px 9px, rgb(255 245 233 / .85)',
  gingham:
    'repeating-linear-gradient(0deg, rgb(246 184 206 / .5) 0 5px, transparent 5px 10px), repeating-linear-gradient(90deg, rgb(246 184 206 / .5) 0 5px, rgb(255 251 245 / .8) 5px 10px)',
  kraft: 'rgb(232 214 192 / .9)',
} as const

export type TapeStyle = keyof typeof patterns

interface Props {
  variant?: TapeStyle
  className?: string
  rotate?: number
  width?: number
}

/** A strip of translucent washi tape with ragged ends. Decorative only. */
export function WashiTape({ variant = 'pink', className = '', rotate = -4, width = 84 }: Props) {
  const style: CSSProperties = {
    background: patterns[variant],
    width,
    transform: `rotate(${rotate}deg)`,
    clipPath:
      'polygon(2% 0, 98% 4%, 100% 30%, 97% 52%, 100% 78%, 98% 100%, 3% 96%, 0 72%, 2% 48%, 0 22%)',
  }
  return <span aria-hidden className={`pointer-events-none absolute z-10 block h-6 ${className}`} style={style} />
}
