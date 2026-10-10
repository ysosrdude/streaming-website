/**
 * Single source of truth for built-in feed providers.
 * Add new default feeds here; override or replace at deploy time via VITE_FEED_PROVIDERS.
 */
export const FEED_CATALOG = [
  {
    id: 'streamcenter',
    name: 'StreamCenter',
    baseUrl: 'https://streamcenter.st',
    kind: 'streamcenter',
    docsUrl: 'https://streamcenter.st/docs',
  },
  {
    id: 'trendy48',
    name: 'Trendy48',
    baseUrl: 'https://trendy48.online/api',
    kind: 'trendy48',
    docsUrl: 'https://trendy48.online',
  },
] as const

export type FeedCatalogEntry = (typeof FEED_CATALOG)[number]
export type FeedId = FeedCatalogEntry['id']
export type FeedKind = FeedCatalogEntry['kind']

const kindSet = new Set<FeedKind>(FEED_CATALOG.map((feed) => feed.kind))

export function isFeedKind(value: string): value is FeedKind {
  return kindSet.has(value as FeedKind)
}

export function getCatalogEntry(id: string): FeedCatalogEntry | undefined {
  return FEED_CATALOG.find((feed) => feed.id === id)
}
