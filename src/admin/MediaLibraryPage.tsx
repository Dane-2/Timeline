import { useState } from 'react'
import type { MediaAsset } from '../types/content'
import { useAsync } from '../hooks/useAsync'
import { deleteMedia, listMedia } from './lib/adminApi'
import { uploadMedia } from './lib/upload'
import { Thumb } from './components/MediaManager'
import { btnDanger, btnGhost, ErrorBanner } from './components/ui'

/** Everything uploaded. Attach files from inside an item; delete here. */
export function MediaLibraryPage() {
  const { data: assets = [], loading, reload } = useAsync(listMedia, [])
  const [progress, setProgress] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function upload(files: FileList) {
    setError(null)
    for (const f of Array.from(files)) {
      try {
        await uploadMedia(f, (pct) => setProgress(`${f.name} — ${pct}%`))
      } catch (e) {
        setError(e instanceof Error ? e.message : String(e))
      }
    }
    setProgress(null)
    reload()
  }

  async function remove(a: MediaAsset) {
    if (!window.confirm('Delete this file everywhere it’s used? This can’t be undone.')) return
    try {
      await deleteMedia(a)
      reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  const totalMb = assets.reduce((s, a) => s + (a.byte_size ?? 0), 0) / 1048576

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-semibold">Media</h1>
          <p className="text-ink-soft mt-1 text-sm">
            {assets.length} files · {totalMb.toFixed(0)} MB. Everything here is private — she only gets a link once it's attached to something that's open.
          </p>
        </div>
        <label className={`${btnGhost} cursor-pointer`}>
          Upload
          <input type="file" multiple accept="image/*,video/*,audio/*" className="hidden" onChange={(e) => e.target.files && upload(e.target.files)} />
        </label>
      </div>
      {progress && <p className="text-ink-soft text-sm">Uploading {progress}</p>}
      <ErrorBanner error={error} />
      {loading && !assets.length ? (
        <p className="text-ink-soft text-sm">Loading…</p>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {assets.map((a) => (
            <li key={a.id} className="overflow-hidden rounded-2xl border border-black/5 bg-white">
              <Thumb asset={a} className="aspect-square w-full" />
              <div className="flex items-center justify-between gap-2 p-2.5">
                <span className="text-ink-soft truncate text-xs">
                  {a.media_type} · {((a.byte_size ?? 0) / 1048576).toFixed(1)} MB
                </span>
                <button onClick={() => remove(a)} className={`${btnDanger} px-2.5 py-1 text-xs`}>
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
