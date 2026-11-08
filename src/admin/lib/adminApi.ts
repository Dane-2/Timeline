import { MEDIA_BUCKET, supabase } from '../../lib/supabase'
import type { Collection, ContentItem, ContentKind, MediaAsset, SiteSettings } from '../../types/content'

/**
 * Admin reads/writes. These run with your session; RLS only lets them
 * through because your profile has role = 'admin'.
 */

export type ContentDraft = Partial<ContentItem> & { kind: ContentKind }

const editable = [
  'kind', 'status', 'title', 'body', 'caption', 'hidden_message', 'event_date', 'occasion', 'locked_teaser',
  'visible_while_locked', 'show_countdown', 'unlock_at', 'unlock_timezone', 'theme', 'placement',
  'collection_id', 'related_content_id', 'is_featured', 'sort_order',
] as const

function pickEditable(d: ContentDraft) {
  const out: Record<string, unknown> = {}
  for (const k of editable) if (k in d) out[k] = d[k as keyof ContentDraft]
  return out
}

function must<T>({ data, error }: { data: T | null; error: { message: string } | null }): T {
  if (error) throw new Error(error.message)
  return data as T
}

export async function listAllContent(): Promise<ContentItem[]> {
  return must(await supabase.from('content_items').select('*').order('kind').order('sort_order').order('created_at'))
}

export async function getContent(id: string): Promise<ContentItem | null> {
  return must(await supabase.from('content_items').select('*').eq('id', id).maybeSingle())
}

export async function saveContent(draft: ContentDraft): Promise<ContentItem> {
  const row = pickEditable(draft)
  if (draft.id) return must(await supabase.from('content_items').update(row).eq('id', draft.id).select().single())
  return must(await supabase.from('content_items').insert(row).select().single())
}

export async function deleteContent(id: string): Promise<void> {
  must(await supabase.from('content_items').delete().eq('id', id))
}

export async function setSortOrders(rows: { id: string; sort_order: number }[]): Promise<void> {
  await Promise.all(rows.map((r) => supabase.from('content_items').update({ sort_order: r.sort_order }).eq('id', r.id).then(must)))
}

// --- Collections -----------------------------------------------------------
export async function listCollections(): Promise<Collection[]> {
  return must(await supabase.from('collections').select('*').order('kind').order('sort_order').order('title'))
}

export async function saveCollection(c: Partial<Collection> & { kind: Collection['kind']; title: string }): Promise<Collection> {
  const { id, ...row } = c
  if (id) return must(await supabase.from('collections').update(row).eq('id', id).select().single())
  return must(await supabase.from('collections').insert(row).select().single())
}

export async function deleteCollection(id: string): Promise<void> {
  must(await supabase.from('collections').delete().eq('id', id))
}

// --- Media -----------------------------------------------------------------
export interface AttachedMedia {
  media_id: string
  role: string
  caption: string | null
  sort_order: number
  media: MediaAsset
}

export async function listMedia(): Promise<MediaAsset[]> {
  return must(await supabase.from('media_assets').select('*').order('created_at', { ascending: false }))
}

export async function listAttached(contentId: string): Promise<AttachedMedia[]> {
  return must(
    await supabase
      .from('content_media')
      .select('media_id, role, caption, sort_order, media:media_assets(*)')
      .eq('content_id', contentId)
      .order('sort_order'),
  ) as unknown as AttachedMedia[]
}

export async function attachMedia(contentId: string, mediaId: string, role = 'gallery', sortOrder = 0): Promise<void> {
  must(await supabase.from('content_media').upsert({ content_id: contentId, media_id: mediaId, role, sort_order: sortOrder }))
}

export async function updateAttachment(contentId: string, mediaId: string, oldRole: string, patch: { role?: string; caption?: string | null; sort_order?: number }) {
  must(await supabase.from('content_media').update(patch).eq('content_id', contentId).eq('media_id', mediaId).eq('role', oldRole))
}

export async function detachMedia(contentId: string, mediaId: string, role: string): Promise<void> {
  must(await supabase.from('content_media').delete().eq('content_id', contentId).eq('media_id', mediaId).eq('role', role))
}

export async function updateMediaAlt(id: string, alt_text: string): Promise<void> {
  must(await supabase.from('media_assets').update({ alt_text }).eq('id', id))
}

/** Removes the file from storage and its row (which also detaches it everywhere). */
export async function deleteMedia(asset: MediaAsset): Promise<void> {
  const { error } = await supabase.storage.from(asset.bucket || MEDIA_BUCKET).remove([asset.storage_path])
  if (error) throw new Error(error.message)
  must(await supabase.from('media_assets').delete().eq('id', asset.id))
}

// --- Settings --------------------------------------------------------------
export async function saveSiteSettings(settings: SiteSettings): Promise<void> {
  must(await supabase.from('site_settings').update({ settings }).eq('id', true))
}
