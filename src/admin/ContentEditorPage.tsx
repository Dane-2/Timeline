import { useEffect, useMemo, useRef, useState } from 'react'
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom'
import type { Collection, ContentItem, ContentKind } from '../types/content'
import { RichText } from '../components/RichText'
import { StickyNote } from '../components/scrapbook/StickyNote'
import { SealedEnvelope } from '../components/scrapbook/SealedEnvelope'
import { deleteContent, getContent, listAllContent, listCollections, saveContent, type ContentDraft } from './lib/adminApi'
import { kindMeta, noteColors, placements, themes, type FieldKey } from './lib/kinds'
import { browserTimezone, commonTimezones, formatInZone, utcToWallTime, wallTimeToUtc } from './lib/timezones'
import { MediaManager } from './components/MediaManager'
import { btnDanger, btnGhost, btnPrimary, Card, ErrorBanner, Field, inputCls, lockState, StateBadge, Toggle } from './components/ui'

const defaultTz = commonTimezones.includes(browserTimezone) ? browserTimezone : 'America/New_York'

function newDraft(kind: ContentKind, theme: string | null): ContentDraft {
  return {
    kind,
    status: 'draft',
    title: '',
    body: {},
    caption: null,
    hidden_message: null,
    event_date: null,
    occasion: null,
    locked_teaser: null,
    unlock_at: null,
    unlock_timezone: defaultTz,
    visible_while_locked: true,
    show_countdown: true,
    theme: theme ?? 'classic',
    placement: null,
    collection_id: null,
    related_content_id: null,
    is_featured: false,
    sort_order: 0,
  }
}

export function ContentEditorPage() {
  const { id } = useParams()
  const [params] = useSearchParams()
  const navigate = useNavigate()
  const isNew = !id || id === 'new'

  const [draft, setDraft] = useState<ContentDraft | null>(null)
  const [dirty, setDirty] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [savedAt, setSavedAt] = useState<number | null>(null)
  const [collections, setCollections] = useState<Collection[]>([])
  const [timeline, setTimeline] = useState<ContentItem[]>([])

  useEffect(() => {
    let cancelled = false
    setError(null)
    if (isNew) {
      const kind = (params.get('kind') as ContentKind) || 'letter'
      setDraft(newDraft(kindMeta[kind] ? kind : 'letter', params.get('theme')))
      setDirty(false)
    } else {
      getContent(id!)
        .then((item) => {
          if (cancelled) return
          if (!item) setError('This item no longer exists.')
          else setDraft(item)
          setDirty(false)
        })
        .catch((e) => setError(String(e.message ?? e)))
    }
    listCollections().then(setCollections).catch(() => {})
    listAllContent()
      .then((all) => setTimeline(all.filter((i) => i.kind === 'timeline')))
      .catch(() => {})
    return () => {
      cancelled = true
    }
  }, [id, isNew, params])

  // Warn before leaving with unsaved changes.
  useEffect(() => {
    if (!dirty) return
    const onBeforeUnload = (e: BeforeUnloadEvent) => e.preventDefault()
    window.addEventListener('beforeunload', onBeforeUnload)
    return () => window.removeEventListener('beforeunload', onBeforeUnload)
  }, [dirty])

  if (error && !draft) return <ErrorBanner error={error} />
  if (!draft) return <p className="text-ink-soft text-sm">Loading…</p>

  const meta = kindMeta[draft.kind]
  const has = (f: FieldKey) => meta.fields.includes(f)
  const set = (patch: Partial<ContentDraft>) => {
    setDraft((d) => ({ ...d!, ...patch }))
    setDirty(true)
  }
  const setBody = (patch: Record<string, unknown>) => set({ body: { ...(draft.body ?? {}), ...patch } })

  async function save(status?: ContentDraft['status']): Promise<ContentItem | null> {
    if (!draft!.title?.trim()) {
      setError(`${meta.titleLabel} is required.`)
      return null
    }
    setSaving(true)
    setError(null)
    try {
      const saved = await saveContent({ ...draft!, status: status ?? draft!.status })
      setDraft(saved)
      setDirty(false)
      setSavedAt(Date.now())
      if (isNew) navigate(`/admin/content/${saved.id}`, { replace: true })
      return saved
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      return null
    } finally {
      setSaving(false)
    }
  }

  async function remove() {
    if (!draft?.id) return
    if (!window.confirm(`Delete “${draft.title}”? This can't be undone.`)) return
    await deleteContent(draft.id)
    setDirty(false)
    navigate('/admin')
  }

  const collectionOptions = collections.filter((c) => c.kind === meta.collectionKind)
  const state = draft.id ? lockState(draft as ContentItem, Date.now()) : 'draft'

  return (
    <div className="space-y-6 pb-28">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-0">
          <Link to="/admin" className="text-ink-soft text-sm hover:underline">
            ← All content
          </Link>
          <h1 className="font-display mt-1 flex items-center gap-3 text-2xl font-semibold md:text-3xl">
            <span>{meta.emoji}</span>
            <span className="truncate">{isNew ? `New ${meta.label.toLowerCase()}` : draft.title || 'Untitled'}</span>
          </h1>
        </div>
        <StateBadge state={state} />
      </div>

      <ErrorBanner error={error} />

      <div className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="space-y-6">
          <Card title="Content">
            <Field label={meta.titleLabel} htmlFor="title">
              {draft.kind === 'sticky_note' || draft.kind === 'quote' || draft.kind === 'cat_message' ? (
                <textarea id="title" rows={3} value={draft.title ?? ''} onChange={(e) => set({ title: e.target.value })} className={inputCls} />
              ) : (
                <input id="title" value={draft.title ?? ''} onChange={(e) => set({ title: e.target.value })} className={inputCls} />
              )}
            </Field>

            {has('body') && (
              <BodyEditor label={meta.bodyLabel ?? 'Text'} value={(draft.body?.text as string) ?? ''} onChange={(text) => setBody({ text })} />
            )}

            {has('caption') && (
              <Field label="Caption" hint="Short, handwritten-style line shown with the photo or memory.">
                <input value={draft.caption ?? ''} onChange={(e) => set({ caption: e.target.value || null })} className={inputCls} />
              </Field>
            )}

            {has('hidden') && (
              <Field label="Hidden message" hint="Revealed only when she taps (flip a note, declassify a SITREP, the p.s. on a postcard).">
                <input value={draft.hidden_message ?? ''} onChange={(e) => set({ hidden_message: e.target.value || null })} className={inputCls} />
              </Field>
            )}

            <div className="grid gap-4 sm:grid-cols-2">
              {has('eventDate') && (
                <Field label="Date it happened">
                  <input type="date" value={draft.event_date ?? ''} onChange={(e) => set({ event_date: e.target.value || null })} className={inputCls} />
                </Field>
              )}
              {has('collection') && (
                <Field
                  label={meta.collectionKind === 'album' ? 'Album' : 'Category'}
                  hint={collectionOptions.length === 0 ? <Link to="/admin/collections" className="underline">Create one first →</Link> : undefined}
                >
                  <select value={draft.collection_id ?? ''} onChange={(e) => set({ collection_id: e.target.value || null })} className={inputCls}>
                    <option value="">None</option>
                    {collectionOptions.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.emoji ? `${c.emoji} ` : ''}
                        {c.title}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
              {has('color') && (
                <Field label="Note color">
                  <div className="flex flex-wrap gap-2">
                    {noteColors.map((c) => (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setBody({ color: c })}
                        aria-pressed={(draft.body?.color ?? 'pink') === c}
                        aria-label={c}
                        className={`h-9 w-9 rounded-lg border-2 transition ${(draft.body?.color ?? 'pink') === c ? 'border-ink scale-110' : 'border-transparent'}`}
                        style={{ background: { pink: '#f9c6d8', petal: '#ffdce8', butter: '#fff0b8', lavender: '#e2d4f5', sky: '#d6e8f7', sage: '#dbe7cc' }[c] }}
                      />
                    ))}
                  </div>
                </Field>
              )}
              {has('url') && (
                <Field label="Link" hint="Spotify, a restaurant, a map pin…">
                  <input type="url" value={(draft.body?.url as string) ?? ''} onChange={(e) => setBody({ url: e.target.value || undefined })} className={inputCls} placeholder="https://" />
                </Field>
              )}
              {has('related') && timeline.length > 0 && (
                <Field label="Related timeline entry">
                  <select value={draft.related_content_id ?? ''} onChange={(e) => set({ related_content_id: e.target.value || null })} className={inputCls}>
                    <option value="">None</option>
                    {timeline
                      .filter((t) => t.id !== draft.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {t.title}
                        </option>
                      ))}
                  </select>
                </Field>
              )}
            </div>
          </Card>

          {has('media') && (
            <Card title="Photos, video & audio">
              <MediaManager contentId={draft.id} ensureSaved={async () => (await save())?.id} />
            </Card>
          )}

          {has('schedule') && <ScheduleCard draft={draft} set={set} withOccasion={has('occasion')} />}

          <Card title="Look & placement">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Theme / room" hint="Rave, Beach and SEAL put it in that tab. Holiday themes change the stationery.">
                <select value={draft.theme ?? 'classic'} onChange={(e) => set({ theme: e.target.value })} className={inputCls}>
                  {themes.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </Field>
              {has('placement') && (
                <Field label="Where it shows up">
                  <select value={draft.placement ?? ''} onChange={(e) => set({ placement: e.target.value || null })} className={inputCls}>
                    {placements.map((p) => (
                      <option key={p.value} value={p.value}>
                        {p.label}
                      </option>
                    ))}
                  </select>
                </Field>
              )}
            </div>
            {has('featured') && (
              <Toggle checked={!!draft.is_featured} onChange={(v) => set({ is_featured: v })} label="Feature on the homepage" hint="The big polaroid on her dashboard." />
            )}
          </Card>
        </div>

        <aside className="space-y-6 lg:sticky lg:top-20 lg:self-start">
          <Preview draft={draft} />
        </aside>
      </div>

      {/* Sticky action bar */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-black/5 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-2 px-4 py-3">
          <span className="text-ink-soft mr-auto text-xs">
            {saving ? 'Saving…' : dirty ? 'Unsaved changes' : savedAt ? 'Saved ✓' : draft.status === 'published' ? 'Published' : 'Draft'}
          </span>
          {draft.id && (
            <button className={btnDanger} onClick={remove} disabled={saving}>
              Delete
            </button>
          )}
          {draft.status === 'published' ? (
            <>
              <button className={btnGhost} onClick={() => save('draft')} disabled={saving}>
                Unpublish
              </button>
              <button className={btnPrimary} onClick={() => save()} disabled={saving}>
                Save
              </button>
            </>
          ) : (
            <>
              <button className={btnGhost} onClick={() => save('draft')} disabled={saving}>
                Save draft
              </button>
              <button className={btnPrimary} onClick={() => save('published')} disabled={saving}>
                {draft.unlock_at ? 'Schedule' : 'Publish'}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

/** Textarea with Bold / Italic buttons that insert **…** / *…* around the selection. */
function BodyEditor({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  const ref = useRef<HTMLTextAreaElement>(null)
  function wrap(marker: string) {
    const el = ref.current
    if (!el) return
    const { selectionStart: s, selectionEnd: e } = el
    const next = value.slice(0, s) + marker + value.slice(s, e) + marker + value.slice(e)
    onChange(next)
    requestAnimationFrame(() => {
      el.focus()
      el.setSelectionRange(s + marker.length, e + marker.length)
    })
  }
  return (
    <Field label={label} hint="Blank line = new paragraph. **bold**, *italic*.">
      <div className="overflow-hidden rounded-xl border border-black/10 focus-within:border-blush-deep focus-within:ring-4 focus-within:ring-petal">
        <div className="flex gap-1 border-b border-black/5 bg-cream/40 px-2 py-1.5">
          <button type="button" onClick={() => wrap('**')} className="rounded-md px-2.5 py-1 text-sm font-bold hover:bg-white" aria-label="Bold">
            B
          </button>
          <button type="button" onClick={() => wrap('*')} className="rounded-md px-2.5 py-1 text-sm italic hover:bg-white" aria-label="Italic">
            I
          </button>
        </div>
        <textarea
          ref={ref}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          rows={10}
          className="text-ink block w-full resize-y bg-white px-3 py-2.5 text-[0.95rem] leading-relaxed outline-none"
        />
      </div>
    </Field>
  )
}

function ScheduleCard({ draft, set, withOccasion }: { draft: ContentDraft; set: (p: Partial<ContentDraft>) => void; withOccasion: boolean }) {
  const tz = draft.unlock_timezone ?? defaultTz
  const scheduled = !!draft.unlock_at
  const wall = draft.unlock_at ? utcToWallTime(draft.unlock_at, tz) : ''
  const tzOptions = useMemo(() => Array.from(new Set([...commonTimezones, browserTimezone, tz])), [tz])

  return (
    <Card title="Schedule">
      <Toggle
        checked={scheduled}
        onChange={(on) => {
          if (on) {
            const tomorrow = new Date(Date.now() + 86_400_000).toISOString().slice(0, 10)
            set({ unlock_at: wallTimeToUtc(`${tomorrow}T08:00`, tz) })
          } else set({ unlock_at: null })
        }}
        label="Keep it sealed until a date"
        hint="The database unlocks it at that moment — no one needs to be online."
      />
      {scheduled && (
        <>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Unlocks at">
              <input
                type="datetime-local"
                value={wall}
                onChange={(e) => e.target.value && set({ unlock_at: wallTimeToUtc(e.target.value, tz) })}
                className={inputCls}
              />
            </Field>
            <Field label="In this timezone" hint="Pick where she'll be.">
              <select
                value={tz}
                onChange={(e) => {
                  // Keep the same wall-clock time, re-anchored to the new zone.
                  const next = e.target.value
                  set({ unlock_timezone: next, unlock_at: wall ? wallTimeToUtc(wall, next) : draft.unlock_at })
                }}
                className={inputCls}
              >
                {tzOptions.map((z) => (
                  <option key={z} value={z}>
                    {z.replace('_', ' ')}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          {draft.unlock_at && (
            <p className="bg-lilac/50 text-mauve rounded-xl px-3 py-2 text-xs">
              Opens {formatInZone(draft.unlock_at, tz)}
              {browserTimezone !== tz && <> · that's {formatInZone(draft.unlock_at, browserTimezone)} for you</>}
            </p>
          )}
          <div className="grid gap-4 sm:grid-cols-2">
            {withOccasion && (
              <Field label="Occasion (shown while sealed)">
                <input value={draft.occasion ?? ''} onChange={(e) => set({ occasion: e.target.value || null })} className={inputCls} placeholder="Christmas" />
              </Field>
            )}
            <Field label="Teaser (shown while sealed)">
              <input value={draft.locked_teaser ?? ''} onChange={(e) => set({ locked_teaser: e.target.value || null })} className={inputCls} placeholder="Not quite time yet…" />
            </Field>
          </div>
          <Toggle checked={draft.visible_while_locked ?? true} onChange={(v) => set({ visible_while_locked: v })} label="Show a sealed envelope before it opens" hint="Off = a total surprise; she won't know it exists." />
          <Toggle checked={draft.show_countdown ?? true} onChange={(v) => set({ show_countdown: v })} label="Show the countdown" />
        </>
      )}
    </Card>
  )
}

/** Roughly how she'll experience this item, right now. */
function Preview({ draft }: { draft: ContentDraft }) {
  const state = lockState({ status: draft.status ?? 'draft', unlock_at: draft.unlock_at ?? null }, Date.now())
  return (
    <Card title="How she sees it">
      <p className="text-ink-soft text-xs leading-relaxed">
        {state === 'draft' && 'Draft — completely invisible to her until you publish.'}
        {state === 'locked' &&
          (draft.visible_while_locked
            ? `Sealed until ${formatInZone(draft.unlock_at!, draft.unlock_timezone ?? defaultTz)}. She sees only the envelope below — nothing inside leaves the server early.`
            : 'Hidden until it unlocks — she won’t know it exists.')}
        {state === 'open' && 'Visible to her now.'}
      </p>

      {state === 'locked' && draft.visible_while_locked ? (
        <div className="text-center">
          <SealedEnvelope theme={draft.theme} className="mx-auto w-44" />
          <p className="font-display mt-2 text-sm font-semibold">{draft.occasion ?? 'A surprise'}</p>
          <p className="hand text-mauve text-lg">{draft.locked_teaser ?? 'not quite time yet…'}</p>
        </div>
      ) : draft.kind === 'sticky_note' ? (
        <div className="mx-auto w-44">
          <StickyNote color={draft.body?.color} rotate={-3}>
            <span className="hand text-xl leading-snug">{draft.title || '…'}</span>
          </StickyNote>
        </div>
      ) : (
        <div className="bg-cream/50 rounded-xl p-4">
          <p className="font-display font-semibold">{draft.title || 'Untitled'}</p>
          {draft.caption && <p className="hand text-mauve mt-1 text-lg">{draft.caption}</p>}
          <RichText text={draft.body?.text as string} className="text-ink mt-2 text-sm leading-relaxed" />
        </div>
      )}
    </Card>
  )
}
