import { useMemo } from 'react'
import type { ContentItem } from '../../types/content'
import { useAsync } from '../../hooks/useAsync'
import { useSignedUrl } from '../../hooks/useSignedUrl'
import { fetchMediaFor } from '../content/api'
import { Polaroid } from '../../components/scrapbook/Polaroid'
import { Sparkle } from '../../components/scrapbook/Doodles'
import { formatLongDate } from '../../lib/dates'

const featurable = new Set(['photo', 'memory', 'timeline'])

export function FeaturedMemory({ items }: { items: ContentItem[] }) {
  const featured = useMemo(
    () => items.find((i) => i.is_featured) ?? items.filter((i) => featurable.has(i.kind)).at(-1),
    [items],
  )
  const { data: media } = useAsync(() => fetchMediaFor(featured ? [featured.id] : []), [featured?.id])
  const image = media?.find((m) => m.media.media_type === 'image' && (m.role === 'primary' || m.role === 'gallery'))
  const src = useSignedUrl(image?.media.storage_path)

  return (
    <section aria-label="Featured memory" className="relative">
      <Polaroid
        src={src}
        alt={image?.media.alt_text ?? featured?.title ?? ''}
        rotate={-2.5}
        tape="gingham"
        className="mx-auto w-full max-w-[19rem]"
        caption={featured?.caption ?? featured?.title ?? 'a favorite goes here'}
        placeholder={
          <span className="flex flex-col items-center gap-2">
            <Sparkle className="h-8 w-8" />
            <span className="hand text-xl">a picture is on its way</span>
          </span>
        }
      />
      {featured?.event_date && (
        <p className="stamp text-ink-soft mt-3 text-center">{formatLongDate(featured.event_date)}</p>
      )}
    </section>
  )
}
