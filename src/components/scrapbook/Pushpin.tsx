const colors = {
  pink: ['#f6b8ce', '#c2456e'],
  lavender: ['#d3c2ec', '#8c6178'],
  butter: ['#fff0b8', '#d9a93e'],
} as const

export function Pushpin({ color = 'pink', className = '' }: { color?: keyof typeof colors; className?: string }) {
  const [light, dark] = colors[color]
  return (
    <svg aria-hidden viewBox="0 0 28 28" className={`pointer-events-none absolute z-10 h-7 w-7 ${className}`}>
      <ellipse cx="15" cy="23" rx="6" ry="2" fill="rgb(58 48 52 / .18)" />
      <circle cx="14" cy="12" r="9" fill={dark} />
      <circle cx="14" cy="11" r="8" fill={light} />
      <circle cx="11" cy="8" r="2.4" fill="white" opacity=".75" />
    </svg>
  )
}
