import { useState } from 'react'
import type { Collection, CollectionKind } from '../types/content'
import { useAsync } from '../hooks/useAsync'
import { deleteCollection, listCollections, saveCollection } from './lib/adminApi'
import { btnGhost, btnPrimary, Card, ErrorBanner, inputCls } from './components/ui'

const groups: { kind: CollectionKind; title: string; hint: string; examples: string }[] = [
  { kind: 'favorite_category', title: 'Favorite categories', hint: 'Sections of “Your Favorite Things”.', examples: 'Foods, Restaurants, Taylor Swift, Cats, Movies…' },
  { kind: 'album', title: 'Photo albums', hint: 'Groups in the photo gallery.', examples: 'Favorite memories, Funny pictures, Adventures…' },
  { kind: 'joke_category', title: 'Inside-joke categories', hint: 'Optional grouping for inside jokes.', examples: 'Nicknames, Sayings, Food…' },
]

export function CollectionsPage() {
  const { data: all = [], reload } = useAsync(listCollections, [])
  const [error, setError] = useState<string | null>(null)

  const run = async (fn: () => Promise<unknown>) => {
    setError(null)
    try {
      await fn()
      reload()
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    }
  }

  return (
    <div className="space-y-6">
      <h1 className="font-display text-3xl font-semibold">Collections</h1>
      <ErrorBanner error={error} />
      {groups.map((g) => (
        <Card key={g.kind} title={g.title}>
          <p className="text-ink-soft -mt-2 text-sm">
            {g.hint} <span className="italic">e.g. {g.examples}</span>
          </p>
          <ul className="space-y-2">
            {all
              .filter((c) => c.kind === g.kind)
              .map((c) => (
                <CollectionRow key={c.id} c={c} onSave={(patch) => run(() => saveCollection({ ...c, ...patch }))} onDelete={() => window.confirm(`Delete “${c.title}”? Items in it stay, just ungrouped.`) && run(() => deleteCollection(c.id))} />
              ))}
          </ul>
          <NewCollection onCreate={(title, emoji) => run(() => saveCollection({ kind: g.kind, title, emoji: emoji || null, status: 'published' }))} />
        </Card>
      ))}
    </div>
  )
}

function CollectionRow({ c, onSave, onDelete }: { c: Collection; onSave: (p: Partial<Collection>) => void; onDelete: () => void }) {
  const [title, setTitle] = useState(c.title)
  const [emoji, setEmoji] = useState(c.emoji ?? '')
  return (
    <li className="flex flex-wrap items-center gap-2">
      <input value={emoji} onChange={(e) => setEmoji(e.target.value)} onBlur={() => emoji !== (c.emoji ?? '') && onSave({ emoji: emoji || null })} className={`${inputCls} w-14 text-center`} aria-label="Emoji" />
      <input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => title.trim() && title !== c.title && onSave({ title })} className={`${inputCls} min-w-0 flex-1`} aria-label="Title" />
      <button onClick={() => onSave({ status: c.status === 'published' ? 'draft' : 'published' })} className={`${btnGhost} px-3 py-1.5 text-xs`}>
        {c.status === 'published' ? 'Visible' : 'Hidden'}
      </button>
      <button onClick={onDelete} className="text-berry px-2 text-xs hover:underline">
        Delete
      </button>
    </li>
  )
}

function NewCollection({ onCreate }: { onCreate: (title: string, emoji: string) => void }) {
  const [title, setTitle] = useState('')
  const [emoji, setEmoji] = useState('')
  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        if (!title.trim()) return
        onCreate(title.trim(), emoji.trim())
        setTitle('')
        setEmoji('')
      }}
      className="flex flex-wrap gap-2 border-t border-black/5 pt-4"
    >
      <input value={emoji} onChange={(e) => setEmoji(e.target.value)} placeholder="🍜" className={`${inputCls} w-14 text-center`} aria-label="Emoji" />
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="New…" className={`${inputCls} min-w-0 flex-1`} aria-label="New title" />
      <button className={btnPrimary}>Add</button>
    </form>
  )
}
