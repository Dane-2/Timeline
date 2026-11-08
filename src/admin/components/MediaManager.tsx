import { useCallback, useEffect, useRef, useState } from 'react'
import type { MediaAsset } from '../../types/content'
import { useSignedUrl } from '../../hooks/useSignedUrl'
import { attachMedia, detachMedia, listAttached, listMedia, updateAttachment, updateMediaAlt, type AttachedMedia } from '../lib/adminApi'
import { uploadMedia } from '../lib/upload'
import { btnGhost, inputCls } from './ui'

interface Upload {
  name: string
  pct: number
  error?: string
}

const roles = [
  { value: 'primary', label: 'Main' },
  { value: 'gallery', label: 'Gallery' },
  { value: 'alternate', label: 'Alternate (secret swap)' },
  { value: 'thumbnail', label: 'Video thumbnail' },
  { value: 'attachment', label: 'Attachment' },
]

/**
 * Photos/videos/audio attached to one content item. Upload new files
 * (with progress) or pick from the library. `ensureSaved` lets a brand-new
 * item save itself as a draft first so there's something to attach to.
 */
export function MediaManager({ contentId, ensureSaved }: { contentId?: string; ensureSaved: () => Promise<string | undefined> }) {
  const [attached, setAttached] = useState<AttachedMedia[]>([])
  const [uploads, setUploads] = useState<Upload[]>([])
  const [picking, setPicking] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const refresh = useCallback(async () => {
    if (contentId) setAttached(await listAttached(contentId))
  }, [contentId])

  useEffect(() => {
    void refresh()
  }, [refresh])

  async function handleFiles(files: FileList | File[]) {
    const list = Array.from(files)
    if (!list.length) return
    const id = contentId ?? (await ensureSaved())
    if (!id) return
    setUploads((u) => [...u, ...list.map((f) => ({ name: f.name, pct: 0 }))])
    for (const [i, file] of list.entries()) {
      const setOne = (patch: Partial<Upload>) =>
        setUploads((u) => u.map((x) => (x.name === file.name ? { ...x, ...patch } : x)))
      try {
        const asset = await uploadMedia(file, (pct) => setOne({ pct }))
        const role = attached.length === 0 && i === 0 ? 'primary' : 'gallery'
        await attachMedia(id, asset.id, role, attached.length + i)
        setUploads((u) => u.filter((x) => x.name !== file.name))
      } catch (e) {
        setOne({ error: e instanceof Error ? e.message : String(e) })
      }
    }
    if (id === contentId) await refresh()
  }

  return (
    <div className="space-y-4">
      <div
        onDragOver={(e) => {
          e.preventDefault()
          setDragOver(true)
        }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragOver(false)
          void handleFiles(e.dataTransfer.files)
        }}
        className={`flex flex-col items-center gap-3 rounded-2xl border-2 border-dashed px-4 py-6 text-center transition ${
          dragOver ? 'border-blush-deep bg-petal/40' : 'border-black/10 bg-cream/40'
        }`}
      >
        <p className="text-ink-soft text-sm">Drop photos, videos or voice memos here</p>
        <div className="flex flex-wrap justify-center gap-2">
          <button type="button" className={btnGhost} onClick={() => fileInput.current?.click()}>
            Upload files
          </button>
          <button type="button" className={btnGhost} onClick={() => setPicking(true)}>
            Choose from library
          </button>
        </div>
        <input
          ref={fileInput}
          type="file"
          multiple
          accept="image/*,video/*,audio/*"
          className="hidden"
          onChange={(e) => {
            if (e.target.files) void handleFiles(e.target.files)
            e.target.value = ''
          }}
        />
      </div>

      {uploads.map((u) => (
        <div key={u.name} className="rounded-xl border border-black/5 bg-white px-3 py-2">
          <div className="flex justify-between text-xs">
            <span className="truncate">{u.name}</span>
            <span className={u.error ? 'text-berry' : 'text-ink-soft'}>{u.error ? 'Failed' : `${u.pct}%`}</span>
          </div>
          {u.error ? (
            <p className="text-berry mt-1 text-xs">{u.error}</p>
          ) : (
            <div className="bg-petal mt-1.5 h-1.5 overflow-hidden rounded-full">
              <div className="bg-mauve h-full transition-[width]" style={{ width: `${u.pct}%` }} />
            </div>
          )}
        </div>
      ))}

      {attached.length > 0 && (
        <ul className="grid gap-3 sm:grid-cols-2">
          {attached.map((a) => (
            <AttachedRow key={`${a.media_id}-${a.role}`} contentId={contentId!} item={a} onChange={refresh} />
          ))}
        </ul>
      )}

      {picking && (
        <LibraryPicker
          onClose={() => setPicking(false)}
          onPick={async (asset) => {
            const id = contentId ?? (await ensureSaved())
            if (!id) return
            await attachMedia(id, asset.id, attached.length ? 'gallery' : 'primary', attached.length)
            setPicking(false)
            await refresh()
          }}
        />
      )}
    </div>
  )
}

function AttachedRow({ contentId, item, onChange }: { contentId: string; item: AttachedMedia; onChange: () => void }) {
  const [alt, setAlt] = useState(item.media.alt_text ?? '')
  return (
    <li className="flex gap-3 rounded-xl border border-black/5 bg-white p-2.5">
      <Thumb asset={item.media} className="h-20 w-20 shrink-0 rounded-lg" />
      <div className="min-w-0 flex-1 space-y-1.5">
        <select
          value={item.role}
          onChange={async (e) => {
            await updateAttachment(contentId, item.media_id, item.role, { role: e.target.value })
            onChange()
          }}
          className={`${inputCls} py-1.5 text-xs`}
          aria-label="Role"
        >
          {roles.map((r) => (
            <option key={r.value} value={r.value}>
              {r.label}
            </option>
          ))}
        </select>
        <input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() => alt !== (item.media.alt_text ?? '') && updateMediaAlt(item.media_id, alt)}
          placeholder="Describe it (for screen readers)"
          className={`${inputCls} py-1.5 text-xs`}
        />
        <button
          type="button"
          onClick={async () => {
            await detachMedia(contentId, item.media_id, item.role)
            onChange()
          }}
          className="text-berry text-xs hover:underline"
        >
          Remove from this item
        </button>
      </div>
    </li>
  )
}

export function Thumb({ asset, className = '' }: { asset: MediaAsset; className?: string }) {
  const src = useSignedUrl(asset.storage_path)
  if (asset.media_type === 'image')
    return src ? <img src={src} alt={asset.alt_text ?? ''} className={`${className} bg-petal/40 object-cover`} /> : <div className={`${className} bg-petal/40 animate-pulse`} />
  if (asset.media_type === 'video')
    return src ? <video src={src} muted playsInline preload="metadata" className={`${className} bg-black object-cover`} /> : <div className={`${className} bg-black/80`} />
  return <div className={`${className} bg-lilac grid place-items-center text-2xl`}>🎙️</div>
}

function LibraryPicker({ onClose, onPick }: { onClose: () => void; onPick: (a: MediaAsset) => void }) {
  const [assets, setAssets] = useState<MediaAsset[] | null>(null)
  useEffect(() => {
    listMedia().then(setAssets)
  }, [])
  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-6" onClick={onClose}>
      <div className="max-h-[85dvh] w-full max-w-2xl overflow-y-auto rounded-t-3xl bg-white p-5 sm:rounded-3xl" onClick={(e) => e.stopPropagation()}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-display text-lg font-semibold">Media library</h3>
          <button onClick={onClose} className={btnGhost}>
            Close
          </button>
        </div>
        {!assets ? (
          <p className="text-ink-soft text-sm">Loading…</p>
        ) : assets.length === 0 ? (
          <p className="text-ink-soft text-sm">Nothing uploaded yet.</p>
        ) : (
          <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
            {assets.map((a) => (
              <li key={a.id}>
                <button onClick={() => onPick(a)} className="block w-full overflow-hidden rounded-xl ring-mauve hover:ring-2">
                  <Thumb asset={a} className="aspect-square w-full" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
