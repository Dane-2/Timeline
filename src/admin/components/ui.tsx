import type { ReactNode } from 'react'
import type { ContentItem } from '../../types/content'

export const inputCls =
  'w-full rounded-xl border border-black/10 bg-white px-3 py-2.5 text-[0.95rem] text-ink outline-none transition focus:border-blush-deep focus:ring-4 focus:ring-petal'
export const btnPrimary =
  'inline-flex items-center justify-center gap-2 rounded-full bg-mauve px-5 py-2.5 text-sm font-semibold text-cream transition hover:bg-ink disabled:opacity-50'
export const btnGhost =
  'inline-flex items-center justify-center gap-2 rounded-full border border-black/10 bg-white px-4 py-2 text-sm font-medium text-ink transition hover:bg-petal/40 disabled:opacity-50'
export const btnDanger =
  'inline-flex items-center justify-center gap-2 rounded-full border border-berry/30 bg-white px-4 py-2 text-sm font-medium text-berry transition hover:bg-berry hover:text-white'

export function Field({ label, hint, children, htmlFor }: { label: string; hint?: ReactNode; children: ReactNode; htmlFor?: string }) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={htmlFor} className="text-ink block text-sm font-semibold">
        {label}
      </label>
      {children}
      {hint && <p className="text-ink-soft text-xs leading-relaxed">{hint}</p>}
    </div>
  )
}

export function Card({ title, children, actions }: { title?: string; children: ReactNode; actions?: ReactNode }) {
  return (
    <section className="rounded-2xl border border-black/5 bg-white p-5 shadow-[0_8px_24px_-18px_rgb(58_48_52_/_0.4)] md:p-6">
      {(title || actions) && (
        <div className="mb-4 flex items-center justify-between gap-3">
          {title && <h2 className="font-display text-lg font-semibold">{title}</h2>}
          {actions}
        </div>
      )}
      <div className="space-y-4">{children}</div>
    </section>
  )
}

export function Toggle({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex cursor-pointer items-start gap-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="accent-mauve mt-1 h-4 w-4" />
      <span>
        <span className="text-ink block text-sm font-medium">{label}</span>
        {hint && <span className="text-ink-soft block text-xs">{hint}</span>}
      </span>
    </label>
  )
}

export type LockState = 'draft' | 'locked' | 'open'

/** What she'd experience for this item at instant `atMs` (admin-side mirror of the RLS rule). */
export function lockState(item: Pick<ContentItem, 'status' | 'unlock_at'>, atMs: number): LockState {
  if (item.status !== 'published') return 'draft'
  if (item.unlock_at && new Date(item.unlock_at).getTime() > atMs) return 'locked'
  return 'open'
}

export function StateBadge({ state }: { state: LockState }) {
  const styles: Record<LockState, string> = {
    draft: 'bg-black/5 text-ink-soft',
    locked: 'bg-lilac text-mauve',
    open: 'bg-sage/70 text-pine',
  }
  const text: Record<LockState, string> = { draft: 'Draft', locked: '🔒 Locked', open: 'Visible' }
  return <span className={`inline-flex shrink-0 items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${styles[state]}`}>{text[state]}</span>
}

export function ErrorBanner({ error }: { error: string | null }) {
  if (!error) return null
  return (
    <p role="alert" className="border-berry/30 bg-berry/5 text-berry rounded-xl border px-4 py-3 text-sm">
      {error}
    </p>
  )
}
