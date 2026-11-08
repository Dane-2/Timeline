import { useEffect, useState } from 'react'
import { defaultSiteSettings, type SiteSettings } from '../types/content'
import { fetchSiteSettings } from '../features/content/api'
import { saveSiteSettings } from './lib/adminApi'
import { btnPrimary, Card, ErrorBanner, Field, inputCls } from './components/ui'

/** Her name, homepage text and key dates. Readable by her, so no secrets here. */
export function SettingsPage() {
  const [s, setS] = useState<SiteSettings | null>(null)
  const [status, setStatus] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSiteSettings().then(setS).catch((e) => setError(String(e.message ?? e)))
  }, [])

  if (!s) return <ErrorBanner error={error} />
  const set = (patch: Partial<SiteSettings>) => setS({ ...s, ...patch })
  const text = (key: keyof SiteSettings, label: string, hint?: string, placeholder?: string) => (
    <Field label={label} hint={hint}>
      <input value={(s[key] as string) ?? ''} placeholder={placeholder} onChange={(e) => set({ [key]: e.target.value || null })} className={inputCls} />
    </Field>
  )

  return (
    <form
      className="space-y-6"
      onSubmit={async (e) => {
        e.preventDefault()
        setError(null)
        try {
          await saveSiteSettings({ ...defaultSiteSettings, ...s })
          setStatus('Saved ✓ — reload her site to see it.')
        } catch (err) {
          setError(err instanceof Error ? err.message : String(err))
        }
      }}
    >
      <h1 className="font-display text-3xl font-semibold">Settings</h1>
      <ErrorBanner error={error} />
      <Card title="Her">
        {text('herName', 'Her name', 'Used for “Hi, ___” and the SEAL clearance line.')}
        {text('signature', 'How you sign letters', undefined, 'Love, …')}
      </Card>
      <Card title="Front cover">
        {text('siteTitle', 'Title')}
        {text('siteSubtitle', 'Subtitle')}
        {text('enterLabel', 'Button')}
      </Card>
      <Card title="Dates">
        <Field label="Ship date" hint="Drives the SEAL mission clock (T-minus, then Day 001…).">
          <input type="date" value={s.departureDate ?? ''} onChange={(e) => set({ departureDate: e.target.value || null })} className={inputCls} />
        </Field>
      </Card>
      <div className="flex items-center gap-3">
        <button className={btnPrimary}>Save settings</button>
        {status && <span className="text-ink-soft text-sm">{status}</span>}
      </div>
    </form>
  )
}
