function joinBase(path: string, apiBase: string): string {
  if (path.startsWith('http')) return path
  const base = apiBase.replace(/\/+$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export function badgeImageUrl(badgeId: string, apiBase?: string): string {
  if (!apiBase) return ''
  const id = badgeId.replace(/\.webp$/i, '')
  return joinBase(`/api/images/badge/${encodeURIComponent(id)}.webp`, apiBase)
}

export function posterImageUrl(
  poster?: string,
  apiBase?: string,
): string | undefined {
  if (!poster || !apiBase) return undefined
  if (poster.startsWith('http')) return poster

  let path = poster.startsWith('/') ? poster : `/${poster}`
  if (path.includes('/poster/') && !path.endsWith('.webp')) {
    path = `${path}.webp`
  }
  return joinBase(path, apiBase)
}
