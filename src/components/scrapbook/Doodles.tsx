import type { SVGProps } from 'react'

type P = SVGProps<SVGSVGElement>
const base = { fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round' } as const

export const Sparkle = (p: P) => (
  <svg aria-hidden viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 3c.6 4.2 2.4 6.3 6.5 9-4.1 2.7-5.9 4.8-6.5 9-.6-4.2-2.4-6.3-6.5-9 4.1-2.7 5.9-4.8 6.5-9Z" />
  </svg>
)

export const Star = (p: P) => (
  <svg aria-hidden viewBox="0 0 24 24" {...base} {...p}>
    <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.8Z" />
  </svg>
)

export const Heart = (p: P) => (
  <svg aria-hidden viewBox="0 0 24 24" {...base} {...p}>
    <path d="M12 20c-5.5-3.6-8.5-6.9-8.5-10.4A4.4 4.4 0 0 1 12 7.4a4.4 4.4 0 0 1 8.5 2.2c0 3.5-3 6.8-8.5 10.4Z" />
  </svg>
)

export const Squiggle = (p: P) => (
  <svg aria-hidden viewBox="0 0 120 16" {...base} {...p}>
    <path d="M2 9c8-8 14 8 22 0s14 8 22 0 14 8 22 0 14 8 22 0 14 8 22 0" />
  </svg>
)

export const Arrow = (p: P) => (
  <svg aria-hidden viewBox="0 0 60 40" {...base} {...p}>
    <path d="M4 34C14 14 30 6 52 8" />
    <path d="M44 3l9 5-7 7" />
  </svg>
)

export const Paw = (p: P) => (
  <svg aria-hidden viewBox="0 0 24 24" fill="currentColor" {...p}>
    <ellipse cx="12" cy="15.5" rx="4.6" ry="3.8" />
    <circle cx="6.3" cy="10.2" r="2" />
    <circle cx="9.7" cy="6.6" r="2" />
    <circle cx="14.3" cy="6.6" r="2" />
    <circle cx="17.7" cy="10.2" r="2" />
  </svg>
)
