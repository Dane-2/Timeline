import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import type { ContentItem, ContentKind } from '../types/content'
import { useAsync } from '../hooks/useAsync'
import { listAllContent, setSortOrders } from './lib/adminApi'
import { kindMeta, kindOrder, themes } from './lib/kinds'
import { formatInZone } from './lib/timezones'
import { btnGhost, btnPrimary, ErrorBanner, inputCls, lockState, StateBadge } from './components/ui'

export function ContentListPage() {
  const { data: items = [], loading, error, reload } = useAsync(listAllContent, [])
  const navigate = useNavigate()
  const [kind, setKind] = useState<ContentKind | 'all'>('all')
  const [theme, setTheme] = useState('all')
  const [query, setQuery] = useState('')
  const [previewDate, setPreviewDate] = useState('') // yyyy-mm-dd — "what would she see then?"
  const [creating, setCreating] = useState(false)

  const at = previewDate ? new Date(`${previewDate}T12:00:00`).getTime() : Date.now()

  const filtered = useMemo(
    () =>
      items.filter(
        (i) =>
          (kind === 'all' || i.kind === kind) &&
          (theme === 'all' || i.theme === theme) &&
          (!query || `${i.title} ${i.caption ?? ''} ${i.occasion ?? ''}`.toLowerCase().includes(query.toLowerCase())),
      ),
    [items, kind, theme, query],
  )
  const counts = useMemo(() => {
    const c = { draft: 0, locked: 0, open: 0 }
    for (const i of items) c[lockState(i, at)]++
    return c
  }, [items, at])

  // Move within its own kind; normalizes sort_order to 10, 20, 30… first.
  async function move(item: ContentItem, dir: -1 | 1) {
    const siblings = items.filter((i) => i.kind === item.kind)
    const idx = siblings.findIndex((s) => s.id === item.id)
    const swap = siblings[idx + dir]
    if (!swap) return
    const reordered = siblings.map((s, i) => ({ id: s.id, sort_order: (i + 1) * 10 }))
    reordered[idx].sort_order = (idx + dir + 1) * 10
    reordered[idx + dir].sort_order = (idx + 1) * 10
    await setSortOrders(reordered)
    reload()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Content</h1>
          <p className="text-ink-soft mt-1 text-sm">
            {counts.open} visible · {counts.locked} locked · {counts.draft} drafts
            {previewDate && <> — as of {new Date(at).toLocaleDateString(undefined, { month: 'long', day: 'numeric', year: 'numeric' })}</>}
          </p>
        </div>
        <div className="relative">
          <button className={btnPrimary} onClick={() => setCreating((c) => !c)} aria-expanded={creating}>
            + New
          </button>
          {creating && (
            <ul className="absolute right-0 z-20 mt-2 w-60 overflow-hidden rounded-2xl border border-black/5 bg-white py-1 shadow-xl">
              {kindOrder.map((k) => (
                <li key={k}>
                  <button
                    onClick={() => navigate(`/admin/content/new?kind=${k}`)}
                    className="hover:bg-petal/40 flex w-full items-center gap-3 px-4 py-2 text-left text-sm"
                  >
                    <span className="w-5 text-center">{kindMeta[k].emoji}</span>
                    {kindMeta[k].label}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-black/5 bg-white p-4 sm:grid-cols-4">
        <select value={kind} onChange={(e) => setKind(e.target.value as ContentKind | 'all')} className={inputCls} aria-label="Kind">
          <option value="all">All kinds</option>
          {kindOrder.map((k) => (
            <option key={k} value={k}>
              {kindMeta[k].emoji} {kindMeta[k].label}
            </option>
          ))}
        </select>
        <select value={theme} onChange={(e) => setTheme(e.target.value)} className={inputCls} aria-label="Theme">
          <option value="all">All themes / rooms</option>
          {themes.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search…" className={inputCls} />
        <label className="flex items-center gap-2">
          <span className="text-ink-soft shrink-0 text-xs font-semibold">Preview as of</span>
          <input type="date" value={previewDate} onChange={(e) => setPreviewDate(e.target.value)} className={inputCls} />
        </label>
      </div>

      <ErrorBanner error={error?.message ?? null} />

      {loading && !items.length ? (
        <p className="text-ink-soft text-sm">Loading…</p>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-black/10 bg-white px-6 py-10 text-center">
          <p className="font-display text-lg">Nothing here yet.</p>
          <p className="text-ink-soft mt-1 text-sm">Hit “+ New” to add the first thing.</p>
        </div>
      ) : (
        <ul className="divide-y divide-black/5 overflow-hidden rounded-2xl border border-black/5 bg-white">
          {filtered.map((item) => (
            <li key={item.id} className="flex items-center gap-3 px-4 py-3">
              <span className="w-6 text-center text-lg" title={kindMeta[item.kind].label}>
                {kindMeta[item.kind].emoji}
              </span>
              <Link to={`/admin/content/${item.id}`} className="min-w-0 flex-1">
                <p className="truncate font-medium">{item.title || <span className="text-ink-soft italic">Untitled</span>}</p>
                <p className="text-ink-soft truncate text-xs">
                  {kindMeta[item.kind].label}
                  {item.theme !== 'classic' && <> · {themes.find((t) => t.value === item.theme)?.label ?? item.theme}</>}
                  {item.unlock_at && <> · unlocks {formatInZone(item.unlock_at, item.unlock_timezone)}</>}
                </p>
              </Link>
              <StateBadge state={lockState(item, at)} />
              <div className="hidden shrink-0 gap-1 sm:flex">
                <button className={`${btnGhost} px-2 py-1`} onClick={() => move(item, -1)} aria-label="Move up">
                  ↑
                </button>
                <button className={`${btnGhost} px-2 py-1`} onClick={() => move(item, 1)} aria-label="Move down">
                  ↓
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
