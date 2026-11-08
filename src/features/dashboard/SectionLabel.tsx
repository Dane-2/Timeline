import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'

export function SectionLabel({ children, to, linkLabel = 'see all' }: { children: ReactNode; to?: string; linkLabel?: string }) {
  return (
    <div className="mb-3 flex items-baseline justify-between gap-3">
      <h2 className="font-display text-ink text-xl font-semibold tracking-tight">{children}</h2>
      {to && (
        <Link to={to} className="hand text-mauve shrink-0 text-lg hover:underline">
          {linkLabel} →
        </Link>
      )}
    </div>
  )
}
