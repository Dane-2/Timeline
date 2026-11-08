import { MEDIA_BUCKET, supabase } from '../../lib/supabase'
import {
  defaultSiteSettings,
  type ContentItem,
  type ContentKind,
  type ContentMediaLink,
  type LockedPreview,
  type SiteSettings,
} from '../../types/content'

/**
 * Every read here goes through Row Level Security. The client never filters
 * by date itself — whatever the server returns is, by definition, unlocked.
 */
export async function fetchOpenContent(kinds?: ContentKind[]): Promise<ContentItem[]> {
  let query = supabase.from('content_items').select('*').order('sort_order').order('created_at')
  if (kinds?.length) query = query.in('kind', kinds)
  const { data, error } = await query
  if (error) throw error
  return (data ?? []) as ContentItem[]
}

export async function fetchLockedPreviews(): Promise<LockedPreview[]> {
  const { data, error } = await supabase.rpc('locked_previews')
  if (error) throw error
  return (data ?? []) as LockedPreview[]
}

export async function fetchSiteSettings(): Promise<SiteSettings> {
  const { data, error } = await supabase.from('site_settings').select('settings').maybeSingle()
  if (error) throw error
  return { ...defaultSiteSettings, ...((data?.settings as Partial<SiteSettings>) ?? {}) }
}

export async function fetchMediaFor(contentIds: string[]): Promise<ContentMediaLink[]> {
  if (!contentIds.length) return []
  const { data, error } = await supabase
    .from('content_media')
    .select('content_id, role, caption, sort_order, media:media_assets(*)')
    .in('content_id', contentIds)
    .order('sort_order')
  if (error) throw error
  // A link whose media row is hidden by RLS comes back with media = null.
  return ((data ?? []) as unknown as ContentMediaLink[]).filter((l) => l.media)
}

// ---------------------------------------------------------------------------
// Signed URLs — short-lived, minted per user, refused by storage RLS for
// anything attached only to locked content.
// ---------------------------------------------------------------------------
const SIGNED_URL_TTL_SECONDS = 60 * 60
const signedCache = new Map<string, { url: string; expiresAt: number }>()

export async function getSignedUrl(path: string): Promise<string | null> {
  const cached = signedCache.get(path)
  if (cached && cached.expiresAt - Date.now() > 5 * 60_000) return cached.url
  const { data, error } = await supabase.storage.from(MEDIA_BUCKET).createSignedUrl(path, SIGNED_URL_TTL_SECONDS)
  if (error || !data) return null
  signedCache.set(path, { url: data.signedUrl, expiresAt: Date.now() + SIGNED_URL_TTL_SECONDS * 1000 })
  return data.signedUrl
}

export async function markOpened(contentId: string): Promise<void> {
  // Receipts are per account; logged-out visitors don't get "new!" tracking.
  const { data } = await supabase.auth.getSession()
  if (!data.session) return
  await supabase.from('content_opens').upsert({ content_id: contentId }, { ignoreDuplicates: true })
}

/** Open items tagged with a decoration theme (e.g. 'rave'), filtered server-side. */
export async function fetchOpenContentByTheme(theme: string): Promise<ContentItem[]> {
  const { data, error } = await supabase
    .from('content_items')
    .select('*')
    .eq('theme', theme)
    .neq('kind', 'cat_message')
    .order('sort_order')
    .order('event_date', { ascending: false, nullsFirst: false })
  if (error) throw error
  return (data ?? []) as ContentItem[]
}
