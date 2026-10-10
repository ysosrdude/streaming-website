import { createStreamCenterApi } from '../api/streamcenter'
import { createTrendy48Api, type Trendy48Match } from '../api/trendy48'
import type { BuiltinMatchSelector, Match, MatchSelector } from '../types/api'
import type { CatalogMatch, CatalogSport } from '../types/catalog'
import type { FeedProvider } from '../feeds'
import { formatCategoryLabel } from '../utils/category'

export interface BrowseQuery {
  timeSelector: BuiltinMatchSelector
  sportId: string | null
}

function toStreamCenterCatalog(
  provider: FeedProvider,
  match: Match,
): CatalogMatch {
  return {
    providerId: provider.id,
    providerName: provider.name,
    apiBaseUrl: provider.baseUrl,
    id: match.id,
    key: `${provider.id}:${match.id}`,
    title: match.title,
    category: match.category,
    date: match.date,
    popular: match.popular,
    poster: match.poster,
    teams: match.teams,
    sources: match.sources,
    playback: { kind: 'streamcenter' },
  }
}

export function toTrendy48Catalog(
  provider: FeedProvider,
  match: Trendy48Match,
): CatalogMatch {
  return {
    providerId: provider.id,
    providerName: provider.name,
    id: match.id,
    key: `${provider.id}:${match.id}`,
    title: match.title,
    category: match.category,
    date: match.date,
    popular: match.popular,
    manual: match.manual,
    sources: match.sources.map((s) => ({
      source: s.source,
      id: s.id,
    })),
    playback: { kind: 'trendy48', watchUrl: match.watch_url },
  }
}

function filterBySport<T extends { category: string }>(
  rows: T[],
  sportId: string | null,
): T[] {
  if (!sportId) return rows
  return rows.filter((row) => row.category === sportId)
}

function resolveStreamCenterSelector(
  query: BrowseQuery,
): MatchSelector {
  if (query.sportId) return query.sportId
  return query.timeSelector
}

export async function fetchSportsForProvider(
  provider: FeedProvider,
  signal?: AbortSignal,
): Promise<CatalogSport[]> {
  if (provider.kind === 'streamcenter') {
    const api = createStreamCenterApi(provider.baseUrl)
    const sports = await api.listSports(signal)
    return sports.map((sport) => ({
      id: sport.id,
      name: sport.name,
      providerId: provider.id,
    }))
  }

  const api = createTrendy48Api(provider.baseUrl)
  const categories = await api.listCategories(signal)
  return Object.keys(categories)
    .sort((a, b) => a.localeCompare(b))
    .map((id) => ({
      id,
      name: formatCategoryLabel(id),
      providerId: provider.id,
    }))
}

export async function fetchMatchesForProvider(
  provider: FeedProvider,
  query: BrowseQuery,
  signal?: AbortSignal,
): Promise<CatalogMatch[]> {
  if (provider.kind === 'streamcenter') {
    const api = createStreamCenterApi(provider.baseUrl)
    const selector = resolveStreamCenterSelector(query)
    const matches = await api.listMatches(selector, signal)
    return matches.map((m) => toStreamCenterCatalog(provider, m))
  }

  const api = createTrendy48Api(provider.baseUrl)
  const matches = await api.listMatches(query.timeSelector, signal)
  return filterBySport(matches, query.sportId).map((m) =>
    toTrendy48Catalog(provider, m),
  )
}

export async function fetchPopularForProvider(
  provider: FeedProvider,
  query: BrowseQuery,
  signal?: AbortSignal,
): Promise<CatalogMatch[]> {
  if (provider.kind === 'streamcenter') {
    const api = createStreamCenterApi(provider.baseUrl)
    const selector = resolveStreamCenterSelector(query)
    const matches = await api.listPopularMatches(selector, signal)
    return matches.map((m) => toStreamCenterCatalog(provider, m))
  }

  const api = createTrendy48Api(provider.baseUrl)
  const matches = await api.listPopular(signal)
  return filterBySport(matches, query.sportId).map((m) =>
    toTrendy48Catalog(provider, m),
  )
}
