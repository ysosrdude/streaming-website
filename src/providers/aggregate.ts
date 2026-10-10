import type { CatalogMatch, CatalogSport } from '../types/catalog'
import { formatCategoryLabel } from '../utils/category'
import { FEED_PROVIDERS, type FeedProvider } from '../feeds'
import {
  fetchMatchesForProvider,
  fetchPopularForProvider,
  fetchSportsForProvider,
  type BrowseQuery,
} from './adapters'

export interface ProviderFailure {
  providerId: string
  providerName: string
  error: Error
}

function resolveProviders(selectedIds: string[]): FeedProvider[] {
  const set = new Set(selectedIds)
  return FEED_PROVIDERS.filter((p) => set.has(p.id))
}

async function runPerProvider<T>(
  providers: FeedProvider[],
  runner: (provider: FeedProvider) => Promise<T>,
): Promise<{ values: T[]; failures: ProviderFailure[] }> {
  const results = await Promise.allSettled(
    providers.map((provider) => runner(provider)),
  )

  const values: T[] = []
  const failures: ProviderFailure[] = []

  results.forEach((result, index) => {
    const provider = providers[index]
    if (result.status === 'fulfilled') {
      values.push(result.value)
    } else {
      failures.push({
        providerId: provider.id,
        providerName: provider.name,
        error:
          result.reason instanceof Error
            ? result.reason
            : new Error(String(result.reason)),
      })
    }
  })

  return { values, failures }
}

export function mergeSports(rows: CatalogSport[][]): CatalogSport[] {
  const byId = new Map<string, CatalogSport>()

  for (const group of rows) {
    for (const sport of group) {
      const existing = byId.get(sport.id)
      if (!existing) {
        byId.set(sport.id, sport)
        continue
      }
      if (existing.name === formatCategoryLabel(sport.id) && sport.name) {
        byId.set(sport.id, sport)
      }
    }
  }

  return [...byId.values()].sort((a, b) => a.name.localeCompare(b.name))
}

export function mergeMatches(groups: CatalogMatch[][]): CatalogMatch[] {
  const merged = groups.flat()
  return merged.sort((a, b) => {
    if (a.date === 0 && b.date !== 0) return -1
    if (b.date === 0 && a.date !== 0) return 1
    return a.date - b.date
  })
}

export async function aggregateSports(
  selectedProviderIds: string[],
  signal?: AbortSignal,
): Promise<{ sports: CatalogSport[]; failures: ProviderFailure[] }> {
  const providers = resolveProviders(selectedProviderIds)
  const { values, failures } = await runPerProvider(providers, (provider) =>
    fetchSportsForProvider(provider, signal),
  )
  return { sports: mergeSports(values), failures }
}

export async function aggregateMatches(
  selectedProviderIds: string[],
  query: BrowseQuery,
  signal?: AbortSignal,
): Promise<{ matches: CatalogMatch[]; failures: ProviderFailure[] }> {
  const providers = resolveProviders(selectedProviderIds)
  const { values, failures } = await runPerProvider(providers, (provider) =>
    fetchMatchesForProvider(provider, query, signal),
  )
  return { matches: mergeMatches(values), failures }
}

export async function aggregatePopular(
  selectedProviderIds: string[],
  query: BrowseQuery,
  signal?: AbortSignal,
): Promise<{ matches: CatalogMatch[]; failures: ProviderFailure[] }> {
  const providers = resolveProviders(selectedProviderIds)
  const { values, failures } = await runPerProvider(providers, (provider) =>
    fetchPopularForProvider(provider, query, signal),
  )
  return { matches: mergeMatches(values), failures }
}
