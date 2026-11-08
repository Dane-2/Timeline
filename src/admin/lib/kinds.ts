import type { CollectionKind, ContentKind } from '../../types/content'

export type FieldKey =
  | 'body'
  | 'caption'
  | 'hidden'
  | 'eventDate'
  | 'occasion'
  | 'schedule'
  | 'color'
  | 'url'
  | 'placement'
  | 'collection'
  | 'media'
  | 'featured'
  | 'related'

interface KindMeta {
  label: string
  emoji: string
  /** What the title field means for this kind */
  titleLabel: string
  bodyLabel?: string
  fields: FieldKey[]
  collectionKind?: CollectionKind
  defaultTheme?: string
}

export const kindMeta: Record<ContentKind, KindMeta> = {
  letter: { label: 'Letter', emoji: '💌', titleLabel: 'Title', bodyLabel: 'Letter', fields: ['body', 'occasion', 'schedule', 'media', 'hidden'] },
  open_when: { label: 'Open when…', emoji: '✉️', titleLabel: 'Open when…', bodyLabel: 'Letter', fields: ['body', 'color', 'schedule', 'media', 'hidden'] },
  timeline: { label: 'Timeline entry', emoji: '🧵', titleLabel: 'Title', bodyLabel: 'The story', fields: ['eventDate', 'body', 'caption', 'hidden', 'media', 'featured', 'schedule', 'occasion'] },
  sticky_note: { label: 'Sticky note', emoji: '🗒️', titleLabel: 'Note text', fields: ['color', 'hidden', 'schedule'] },
  memory: { label: 'Memory / post', emoji: '✨', titleLabel: 'Title', bodyLabel: 'Story', fields: ['eventDate', 'body', 'caption', 'hidden', 'media', 'featured', 'schedule', 'related'] },
  photo: { label: 'Photo', emoji: '📸', titleLabel: 'Title', fields: ['media', 'caption', 'eventDate', 'collection', 'hidden', 'featured', 'schedule'], collectionKind: 'album' },
  video: { label: 'Video message', emoji: '🎥', titleLabel: 'Title', bodyLabel: 'Transcript (optional)', fields: ['media', 'caption', 'body', 'eventDate', 'schedule', 'occasion'] },
  audio: { label: 'Audio message', emoji: '🎙️', titleLabel: 'Title', bodyLabel: 'Transcript (optional)', fields: ['media', 'caption', 'body', 'schedule', 'occasion'] },
  inside_joke: { label: 'Inside joke', emoji: '🤭', titleLabel: 'The joke', bodyLabel: 'Backstory', fields: ['body', 'hidden', 'collection', 'eventDate', 'media', 'related'], collectionKind: 'joke_category' },
  favorite: { label: 'Favorite thing', emoji: '⭐', titleLabel: 'Name', bodyLabel: 'Why it reminds me of you', fields: ['collection', 'body', 'caption', 'url', 'media'], collectionKind: 'favorite_category' },
  quote: { label: 'Quote', emoji: '❝', titleLabel: 'Quote', bodyLabel: '', fields: ['caption'] },
  cat_message: { label: 'Cat line', emoji: '🐱', titleLabel: 'What the cat says', fields: ['placement'] },
  easter_egg: { label: 'Easter egg', emoji: '🥚', titleLabel: 'Title', bodyLabel: 'Secret message', fields: ['placement', 'body', 'hidden', 'media', 'schedule'] },
}

export const kindOrder = Object.keys(kindMeta) as ContentKind[]

/** Decoration presets. Rooms (rave/beach/seal) also decide which tab a post appears in. */
export const themes = [
  { value: 'classic', label: 'Classic' },
  { value: 'valentine', label: "Valentine's" },
  { value: 'christmas', label: 'Christmas' },
  { value: 'thanksgiving', label: 'Thanksgiving' },
  { value: 'birthday', label: 'Birthday' },
  { value: 'newyear', label: "New Year's" },
  { value: 'rave', label: 'Rave room' },
  { value: 'beach', label: 'Beach room' },
  { value: 'seal', label: 'SEAL room' },
]

export const noteColors = ['pink', 'petal', 'butter', 'lavender', 'sky', 'sage'] as const

/** Where cat lines / easter eggs show up. */
export const placements = [
  { value: '', label: 'Anywhere (default pages)' },
  { value: 'rave', label: 'Rave room' },
  { value: 'beach', label: 'Beach room' },
  { value: 'seal', label: 'SEAL room' },
  { value: 'dashboard-star', label: 'Dashboard: hidden star' },
  { value: 'cat-paw', label: 'Cat paw' },
]
