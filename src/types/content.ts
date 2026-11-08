export type AppRole = 'admin' | 'visitor'

export type ContentKind =
  | 'letter'
  | 'open_when'
  | 'timeline'
  | 'sticky_note'
  | 'memory'
  | 'photo'
  | 'video'
  | 'audio'
  | 'inside_joke'
  | 'favorite'
  | 'quote'
  | 'cat_message'
  | 'easter_egg'

export type ContentStatus = 'draft' | 'published'

/**
 * Kind-specific data lives in `body`. Every field is optional so new kinds
 * and fields can be added without migrations.
 */
export interface ContentBody {
  text?: string
  /** Sticky-note color key */
  color?: 'pink' | 'petal' | 'butter' | 'lavender' | 'sky' | 'sage'
  /** Link out (Spotify, restaurant, etc.) */
  url?: string
  [key: string]: unknown
}

export interface ContentItem {
  id: string
  kind: ContentKind
  status: ContentStatus
  title: string
  body: ContentBody
  caption: string | null
  hidden_message: string | null
  event_date: string | null
  occasion: string | null
  locked_teaser: string | null
  unlock_at: string | null
  unlock_timezone: string
  visible_while_locked: boolean
  show_countdown: boolean
  theme: string
  placement: string | null
  collection_id: string | null
  related_content_id: string | null
  is_featured: boolean
  sort_order: number
  created_at: string
  updated_at: string
}

/** The only shape a visitor ever receives for still-locked content. */
export interface LockedPreview {
  id: string
  kind: ContentKind
  occasion: string | null
  locked_teaser: string | null
  theme: string
  unlock_at: string | null
  event_date: string | null
  sort_order: number
}

export interface MediaAsset {
  id: string
  bucket: string
  storage_path: string
  media_type: 'image' | 'video' | 'audio'
  mime_type: string | null
  width: number | null
  height: number | null
  duration_seconds: number | null
  byte_size: number | null
  alt_text: string | null
  created_at: string
}

export type CollectionKind = 'album' | 'favorite_category' | 'joke_category'

export interface Collection {
  id: string
  kind: CollectionKind
  title: string
  description: string | null
  theme: string
  emoji: string | null
  status: ContentStatus
  sort_order: number
}

export interface ContentMediaLink {
  content_id: string
  role: 'primary' | 'gallery' | 'thumbnail' | 'alternate' | 'attachment' | 'transcript'
  caption: string | null
  sort_order: number
  media: MediaAsset
}

export interface SiteSettings {
  herName: string | null
  siteTitle: string
  siteSubtitle: string
  enterLabel: string
  signature: string | null
  departureDate: string | null
}

export const defaultSiteSettings: SiteSettings = {
  herName: null,
  siteTitle: 'A Little Piece of Me',
  siteSubtitle: "Some things I wanted you to have while I'm away.",
  enterLabel: 'Come on in ♡',
  signature: null,
  departureDate: '2026-11-09',
}
