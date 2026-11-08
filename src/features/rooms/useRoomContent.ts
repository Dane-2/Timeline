import { useCallback, useMemo } from 'react'
import type { ContentItem } from '../../types/content'
import { useAsync } from '../../hooks/useAsync'
import { fetchMediaFor, fetchOpenContentByTheme, getSignedUrl } from '../content/api'

/**
 * Everything a themed room (rave, beach, seal…) needs: the open items tagged
 * with that theme, and their primary image. All filtered by RLS server-side.
 */
export function useRoomContent(theme: string) {
  const { data: items = [], loading, error } = useAsync(() => fetchOpenContentByTheme(theme), [theme])
  const ids = useMemo(() => items.map((i) => i.id), [items])
  const { data: media = [] } = useAsync(() => fetchMediaFor(ids), [ids.join(',')])

  const pathFor = useCallback(
    (id: string) =>
      media.find((m) => m.content_id === id && m.media.media_type === 'image' && (m.role === 'primary' || m.role === 'gallery'))?.media
        .storage_path,
    [media],
  )

  const withPhotos = items.filter((i) => pathFor(i.id))
  const textOnly = items.filter((i) => !pathFor(i.id))

  const signedSrcFor = useCallback(
    async (item: ContentItem) => {
      const path = pathFor(item.id)
      return path ? getSignedUrl(path) : null
    },
    [pathFor],
  )

  return { items, withPhotos, textOnly, pathFor, signedSrcFor, loading, error }
}
