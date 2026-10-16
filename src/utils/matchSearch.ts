import type { CatalogMatch } from '../types/catalog'
import { formatCategoryLabel } from './category'

export const SEARCH_MIN_LENGTH = 2

function normalize(value: string): string {
  return value.toLowerCase().trim()
}

function matchHaystack(match: CatalogMatch, categoryLabel?: string): string {
  const parts = [
    match.title,
    match.category,
    categoryLabel ?? formatCategoryLabel(match.category),
    match.providerName,
    match.id,
    match.teams?.home?.name,
    match.teams?.away?.name,
  ]
  return normalize(parts.filter(Boolean).join(' '))
}

export function filterCatalogMatches(
  matches: CatalogMatch[],
  query: string,
  categoryLabels?: Map<string, string>,
): CatalogMatch[] {
  const q = normalize(query)
  if (q.length < SEARCH_MIN_LENGTH) return matches

  const tokens = q.split(/\s+/).filter(Boolean)

  const scored = matches
    .map((match) => {
      const haystack = matchHaystack(
        match,
        categoryLabels?.get(match.category),
      )
      const allTokens = tokens.every((token) => haystack.includes(token))
      if (!allTokens) return null

      const title = normalize(match.title)
      let score = 0
      if (title.includes(q)) score += 10
      if (title.startsWith(tokens[0])) score += 5
      score += tokens.length
      return { match, score }
    })
    .filter((row): row is { match: CatalogMatch; score: number } => row !== null)

  scored.sort((a, b) => b.score - a.score || a.match.date - b.match.date)
  return scored.map((row) => row.match)
}
