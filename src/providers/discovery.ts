import type { BuiltinMatchSelector } from '../types/api'
import type { CatalogMatch } from '../types/catalog'
import { aggregateMatches } from './aggregate'

const DISCOVERY_SELECTORS: BuiltinMatchSelector[] = ['live', 'all-today', 'all']

export async function discoverCatalogMatches(
  selectedProviderIds: string[],
  signal?: AbortSignal,
): Promise<CatalogMatch[]> {
  const byKey = new Map<string, CatalogMatch>()

  for (const timeSelector of DISCOVERY_SELECTORS) {
    const { matches } = await aggregateMatches(
      selectedProviderIds,
      { timeSelector, sportId: null },
      signal,
    )
    for (const match of matches) {
      byKey.set(match.key, match)
    }
  }

  return [...byKey.values()]
}
