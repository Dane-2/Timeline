import { useId, type CSSProperties } from 'react'

interface CloudProps {
  className?: string
  /** Mirror horizontally, for symmetrical pairs */
  flip?: boolean
  /** Seconds for one slow drift cycle; 0 = still */
  drift?: number
  delay?: number
  style?: CSSProperties
}

/** A soft pink cloud: blush at the base fading to white on top. */
export function Cloud({ className = '', flip = false, drift = 14, delay = 0, style }: CloudProps) {
  const id = useId()
  return (
    <svg
      aria-hidden
      viewBox="0 0 140 70"
      className={`pointer-events-none ${className}`}
      style={{
        ...style,
        ['--flip' as string]: flip ? -1 : 1,
        transform: flip ? 'scaleX(-1)' : undefined,
        animation: drift ? `cloud-drift ${drift}s ease-in-out ${-delay}s infinite` : undefined,
      }}
    >
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset=".55" stopColor="#ffe3ed" />
          <stop offset="1" stopColor="#f9c9da" />
        </linearGradient>
      </defs>
      <path
        d="M22 66C8 66 2 56 6 46c3-8 11-11 18-9 1-15 14-25 28-22 6-11 24-15 36-7 10-6 26-2 30 12 12 0 20 10 18 22-1 14-12 24-24 24Z"
        fill={`url(#${id})`}
      />
    </svg>
  )
}
