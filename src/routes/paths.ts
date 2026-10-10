import type { CatalogMatch } from '../types/catalog'
import type { BuiltinMatchSelector } from '../types/api'
import { parseTeamsFromTitle } from '../utils/eventMatch'

export const BUILTIN_SELECTORS: {
  id: BuiltinMatchSelector
  label: string
  description: string
}[] = [
  { id: 'live', label: 'Live', description: 'Happening now' },
  { id: 'all-today', label: 'Today', description: 'Scheduled for today' },
  { id: 'all', label: 'All', description: 'Full catalog' },
]

export interface StreamCenterWatchParams {
  source: string
  group: string
  title?: string
}

export function buildEventPath(match: CatalogMatch): string {
  const params = new URLSearchParams()
  params.set('title', match.title)
  params.set('date', String(match.date))
  params.set('category', match.category)
  const home = match.teams?.home?.name ?? parseTeamsFromTitle(match.title).homeTeam
  const away = match.teams?.away?.name ?? parseTeamsFromTitle(match.title).awayTeam
  if (home) params.set('home', home)
  if (away) params.set('away', away)
  return `/event?${params.toString()}`
}

export function buildWatchPath(match: CatalogMatch): string {
  const base = `/watch/${encodeURIComponent(match.providerId)}/${encodeURIComponent(match.id)}`
  const search = new URLSearchParams()
  search.set('title', match.title)

  if (match.playback.kind === 'streamcenter') {
    const primary = match.sources[0]
    if (primary) {
      search.set('source', primary.source)
      search.set('group', primary.id)
    }
  }

  return `${base}?${search.toString()}`
}

export function parseStreamCenterWatchSearch(
  search: URLSearchParams,
): StreamCenterWatchParams | null {
  const source = search.get('source')
  const group = search.get('group')
  if (!source || !group) return null
  const title = search.get('title') ?? undefined
  return { source, group, title }
}

export function homePath(
  timeSelector: BuiltinMatchSelector,
  sportId?: string | null,
): string {
  const base = sportId ? `/sport/${encodeURIComponent(sportId)}` : '/'
  const params = new URLSearchParams()
  if (timeSelector !== 'live') {
    params.set('view', timeSelector)
  }
  const query = params.toString()
  return query ? `${base}?${query}` : base
}
