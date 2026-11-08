import { Heart } from './Doodles'

export const envelopeThemes: Record<string, { paper: string; flap: string; seal: string }> = {
  classic: { paper: '#fff5e9', flap: '#f3e4d2', seal: '#c2456e' },
  valentine: { paper: '#ffdce8', flap: '#f6b8ce', seal: '#c2456e' },
  christmas: { paper: '#f4efe6', flap: '#e1d9cb', seal: '#b8323f' },
  thanksgiving: { paper: '#f7e6cf', flap: '#ecd0a9', seal: '#a8552c' },
  birthday: { paper: '#e6dcf5', flap: '#d3c2ec', seal: '#8c6178' },
  newyear: { paper: '#eef0f7', flap: '#d8dcea', seal: '#3a3034' },
}

/** A closed envelope with a wax seal. Purely visual — it never holds content. */
export function SealedEnvelope({ theme = 'classic', className = '' }: { theme?: string; className?: string }) {
  const t = envelopeThemes[theme] ?? envelopeThemes.classic
  return (
    <svg aria-hidden viewBox="0 0 160 108" className={className}>
      <rect x="2" y="4" width="156" height="100" rx="4" fill={t.paper} stroke="rgb(58 48 52 / .14)" />
      <path d="M2 104 66 58M158 104 94 58" stroke="rgb(58 48 52 / .1)" strokeWidth="1.5" />
      <path d="M2 6 80 64 158 6" fill={t.flap} stroke="rgb(58 48 52 / .14)" />
      <circle cx="80" cy="62" r="13" fill={t.seal} />
      <circle cx="80" cy="62" r="10" fill="none" stroke="rgb(255 255 255 / .35)" strokeWidth="1.5" strokeDasharray="2 2.5" />
      <g transform="translate(73 55) scale(.58)">
        <Heart width={24} height={24} stroke="rgb(255 255 255 / .85)" strokeWidth={2.4} />
      </g>
    </svg>
  )
}
