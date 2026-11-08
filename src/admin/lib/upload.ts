import { MEDIA_BUCKET, supabase, supabaseAnonKey, supabaseUrl } from '../../lib/supabase'
import type { MediaAsset } from '../../types/content'

const MAX_IMAGE_EDGE = 2048
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024 // matches the bucket limit

interface Prepared {
  blob: Blob
  mime: string
  ext: string
  mediaType: MediaAsset['media_type']
  width?: number
  height?: number
  duration?: number
}

/**
 * Photos are resized (long edge 2048px) and re-encoded in the browser so
 * phone uploads are fast and she downloads less. Video/audio go up as-is.
 */
async function prepare(file: File): Promise<Prepared> {
  const mime = file.type || 'application/octet-stream'
  const ext = (file.name.split('.').pop() || 'bin').toLowerCase()

  if (mime.startsWith('image/') && mime !== 'image/gif') {
    try {
      const bitmap = await createImageBitmap(file)
      const scale = Math.min(1, MAX_IMAGE_EDGE / Math.max(bitmap.width, bitmap.height))
      const w = Math.round(bitmap.width * scale)
      const h = Math.round(bitmap.height * scale)
      const canvas = document.createElement('canvas')
      canvas.width = w
      canvas.height = h
      canvas.getContext('2d')!.drawImage(bitmap, 0, 0, w, h)
      bitmap.close()
      // Safari can't encode WebP and silently returns PNG — fall back to JPEG.
      let blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/webp', 0.85))
      if (!blob || blob.type !== 'image/webp') blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, 'image/jpeg', 0.86))
      if (blob) return { blob, mime: blob.type, ext: blob.type === 'image/webp' ? 'webp' : 'jpg', mediaType: 'image', width: w, height: h }
    } catch {
      // Browser can't decode it (e.g. HEIC on Chrome) — upload the original.
    }
    return { blob: file, mime, ext, mediaType: 'image' }
  }

  if (mime.startsWith('video/') || mime.startsWith('audio/')) {
    const mediaType = mime.startsWith('video/') ? 'video' : 'audio'
    const meta = await readMediaMetadata(file, mediaType)
    return { blob: file, mime, ext, mediaType, ...meta }
  }

  if (mime === 'image/gif') return { blob: file, mime, ext, mediaType: 'image' }
  throw new Error(`Unsupported file type: ${mime}`)
}

function readMediaMetadata(file: File, kind: 'video' | 'audio'): Promise<{ width?: number; height?: number; duration?: number }> {
  return new Promise((resolve) => {
    const el = document.createElement(kind)
    const url = URL.createObjectURL(file)
    const done = (v: { width?: number; height?: number; duration?: number }) => {
      URL.revokeObjectURL(url)
      resolve(v)
    }
    el.preload = 'metadata'
    el.onloadedmetadata = () =>
      done({
        duration: Number.isFinite(el.duration) ? el.duration : undefined,
        width: el instanceof HTMLVideoElement ? el.videoWidth : undefined,
        height: el instanceof HTMLVideoElement ? el.videoHeight : undefined,
      })
    el.onerror = () => done({})
    el.src = url
  })
}

/** Raw Storage upload via XHR, because fetch can't report upload progress. */
function xhrUpload(path: string, blob: Blob, mime: string, token: string, onProgress: (pct: number) => void) {
  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('POST', `${supabaseUrl}/storage/v1/object/${MEDIA_BUCKET}/${path}`)
    xhr.setRequestHeader('Authorization', `Bearer ${token}`)
    xhr.setRequestHeader('apikey', supabaseAnonKey)
    xhr.setRequestHeader('Content-Type', mime)
    xhr.setRequestHeader('x-upsert', 'false')
    xhr.setRequestHeader('cache-control', 'max-age=3600')
    xhr.upload.onprogress = (e) => e.lengthComputable && onProgress(Math.round((e.loaded / e.total) * 100))
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resolve()
      else {
        let msg = `Upload failed (${xhr.status})`
        try {
          msg = JSON.parse(xhr.responseText).message ?? msg
        } catch {
          /* keep default */
        }
        reject(new Error(msg))
      }
    }
    xhr.onerror = () => reject(new Error('Network error during upload'))
    xhr.send(blob)
  })
}

export async function uploadMedia(file: File, onProgress: (pct: number) => void): Promise<MediaAsset> {
  const prepared = await prepare(file)
  if (prepared.blob.size > MAX_UPLOAD_BYTES) {
    throw new Error(`${file.name} is ${(prepared.blob.size / 1048576).toFixed(0)} MB — the limit is 50 MB. Export the video at 720p.`)
  }
  const { data } = await supabase.auth.getSession()
  const token = data.session?.access_token
  if (!token) throw new Error('Signed out — sign in again to upload.')

  // Random, unguessable name. (Unguessable is a bonus; RLS is the real lock.)
  const path = `${new Date().getFullYear()}/${crypto.randomUUID()}.${prepared.ext}`
  await xhrUpload(path, prepared.blob, prepared.mime, token, onProgress)

  const { data: row, error } = await supabase
    .from('media_assets')
    .insert({
      storage_path: path,
      media_type: prepared.mediaType,
      mime_type: prepared.mime,
      width: prepared.width ?? null,
      height: prepared.height ?? null,
      duration_seconds: prepared.duration ?? null,
      byte_size: prepared.blob.size,
      alt_text: null,
    })
    .select()
    .single()
  if (error) {
    // Don't leave an orphaned file behind.
    await supabase.storage.from(MEDIA_BUCKET).remove([path])
    throw new Error(error.message)
  }
  return row as MediaAsset
}
