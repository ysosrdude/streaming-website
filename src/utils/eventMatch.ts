import type { CatalogMatch } from '../types/catalog'

const DATE_TOLERANCE_MS = 90 * 60 * 1000

const CATEGORY_ALIASES: Record<string, readonly string[]> = {
  football: ['football', 'soccer'],
  soccer: ['football', 'soccer'],
  'american-football': ['american-football'],
}

export interface EventSeed {
  title: string
  date: number
  category: string
  homeTeam?: string
  awayTeam?: string
}

export function normalizeTitle(title: string): string {
  return title
    .toLowerCase()
    .replace(/\s+vs\.?\s+/gi, ' vs ')
    .replace(/\s+@\s+/gi, ' at ')
    .replace(/\s+at\s+/gi, ' at ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Parse home/away from common title patterns when API omits `teams`. */
export function parseTeamsFromTitle(title: string): {
  homeTeam?: string
  awayTeam?: string
} {
  const vsMatch = title.match(/^(.+?)\s+(?:vs\.?|v\.?)\s+(.+)$/i)
  if (vsMatch) {
    return { homeTeam: vsMatch[1].trim(), awayTeam: vsMatch[2].trim() }
  }

  const atMatch = title.match(/^(.+?)\s+(?:@|at)\s+(.+)$/i)
  if (atMatch) {
    return { homeTeam: atMatch[2].trim(), awayTeam: atMatch[1].trim() }
  }

  return {}
}

function enrichSeed(seed: EventSeed): EventSeed {
  if (seed.homeTeam && seed.awayTeam) return seed
  const parsed = parseTeamsFromTitle(seed.title)
  return {
    ...seed,
    homeTeam: seed.homeTeam ?? parsed.homeTeam,
    awayTeam: seed.awayTeam ?? parsed.awayTeam,
  }
}

function normalizeTeamName(name: string): string {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '')
}

function categoriesCompatible(a: string, b: string): boolean {
  if (a === b) return true
  const groupA = new Set(CATEGORY_ALIASES[a] ?? [a])
  const groupB = CATEGORY_ALIASES[b] ?? [b]
  return groupB.some((id) => groupA.has(id))
}

function datesCompatible(a: number, b: number): boolean {
  if (a === 0 || b === 0) return true
  return Math.abs(a - b) <= DATE_TOLERANCE_MS
}

function teamsAlign(a: CatalogMatch | EventSeed, b: CatalogMatch | EventSeed): boolean {
  const aHome =
    'teams' in a && a.teams?.home?.name
      ? a.teams.home.name
      : 'homeTeam' in a
        ? a.homeTeam
        : undefined
  const aAway =
    'teams' in a && a.teams?.away?.name
      ? a.teams.away.name
      : 'awayTeam' in a
        ? a.awayTeam
        : undefined
  const bHome =
    'teams' in b && b.teams?.home?.name
      ? b.teams.home.name
      : 'homeTeam' in b
        ? b.homeTeam
        : undefined
  const bAway =
    'teams' in b && b.teams?.away?.name
      ? b.teams.away.name
      : 'awayTeam' in b
        ? b.awayTeam
        : undefined

  if (!aHome || !aAway || !bHome || !bAway) return false

  const aSet = new Set([normalizeTeamName(aHome), normalizeTeamName(aAway)])
  return aSet.has(normalizeTeamName(bHome)) && aSet.has(normalizeTeamName(bAway))
}

function titlesAlign(a: string, b: string): boolean {
  const n1 = normalizeTitle(a)
  const n2 = normalizeTitle(b)
  if (!n1 || !n2) return false
  if (n1 === n2) return true
  if (n1.includes(n2) || n2.includes(n1)) return true

  const tokens1 = n1.split(' ').filter((w) => w.length > 2)
  const tokens2 = new Set(n2.split(' ').filter((w) => w.length > 2))
  let overlap = 0
  for (const token of tokens1) {
    if (tokens2.has(token)) overlap++
  }
  const minSize = Math.min(tokens1.length, tokens2.size)
  if (minSize >= 2 && overlap >= minSize) return true
  return minSize >= 3 && overlap >= Math.ceil(minSize * 0.55)
}

function toComparableSeed(b: CatalogMatch | EventSeed): EventSeed {
  if ('key' in b && 'providerId' in b) {
    return enrichSeed(seedFromMatch(b))
  }
  return enrichSeed(b)
}

export function isSameEvent(a: CatalogMatch, b: CatalogMatch | EventSeed): boolean {
  if ('key' in b && 'providerId' in b && a.key === b.key) return true

  const seed = toComparableSeed(b)
  const candidate = enrichSeed(seedFromMatch(a))

  if (!datesCompatible(a.date, seed.date)) return false
  if (teamsAlign(candidate, seed) || teamsAlign(a, seed)) return true
  if (!categoriesCompatible(a.category, seed.category)) return false
  return titlesAlign(a.title, seed.title)
}

export function seedFromMatch(match: CatalogMatch): EventSeed {
  const fromTeams = {
    homeTeam: match.teams?.home?.name,
    awayTeam: match.teams?.away?.name,
  }
  const fromTitle = parseTeamsFromTitle(match.title)
  return enrichSeed({
    title: match.title,
    date: match.date,
    category: match.category,
    homeTeam: fromTeams.homeTeam ?? fromTitle.homeTeam,
    awayTeam: fromTeams.awayTeam ?? fromTitle.awayTeam,
  })
}

export function parseEventSeed(search: URLSearchParams): EventSeed | null {
  const title = search.get('title')
  const category = search.get('category')
  const dateRaw = search.get('date')
  if (!title || !category || dateRaw == null) return null

  const date = Number.parseInt(dateRaw, 10)
  if (!Number.isFinite(date)) return null

  return enrichSeed({
    title,
    category,
    date,
    homeTeam: search.get('home') ?? undefined,
    awayTeam: search.get('away') ?? undefined,
  })
}

export function eventSeedLabel(seed: EventSeed): string {
  if (seed.homeTeam && seed.awayTeam) {
    return `${seed.homeTeam} vs ${seed.awayTeam}`
  }
  return seed.title
}
