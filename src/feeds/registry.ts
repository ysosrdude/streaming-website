import {
  FEED_CATALOG,
  type FeedCatalogEntry,
  type FeedId,
  type FeedKind,
  getCatalogEntry,
  isFeedKind,
} from './catalog'

export interface FeedProvider {
  id: string
  name: string
  baseUrl: string
  kind: FeedKind
  docsUrl?: string
}

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '')
}

function catalogToProvider(entry: FeedCatalogEntry): FeedProvider {
  return {
    id: entry.id,
    name: entry.name,
    baseUrl: normalizeBaseUrl(entry.baseUrl),
    kind: entry.kind,
    docsUrl: entry.docsUrl,
  }
}

type EnvFeedInput = {
  id: string
  name: string
  baseUrl: string
  kind: string
  docsUrl?: string
}

function parseProvidersFromEnv(): FeedProvider[] | null {
  const raw = import.meta.env.VITE_FEED_PROVIDERS
  if (!raw || typeof raw !== 'string') return null

  try {
    const parsed = JSON.parse(raw) as EnvFeedInput[]
    if (!Array.isArray(parsed) || parsed.length === 0) return null

    return parsed.map((entry) => {
      if (!isFeedKind(entry.kind)) {
        throw new Error(`Unknown feed kind "${entry.kind}" for id "${entry.id}"`)
      }
      const catalog = getCatalogEntry(entry.id)
      return {
        id: entry.id,
        name: entry.name,
        baseUrl: normalizeBaseUrl(entry.baseUrl),
        kind: entry.kind,
        docsUrl: entry.docsUrl ?? catalog?.docsUrl,
      }
    })
  } catch (error) {
    console.warn('VITE_FEED_PROVIDERS is invalid; using FEED_CATALOG.', error)
    return null
  }
}

function applyLegacyStreamCenterOverride(
  providers: FeedProvider[],
): FeedProvider[] {
  const override = import.meta.env.VITE_API_BASE_URL
  if (!override || typeof override !== 'string') return providers

  const streamCenterId = FEED_CATALOG.find((f) => f.kind === 'streamcenter')?.id
  if (!streamCenterId) return providers

  return providers.map((provider) =>
    provider.id === streamCenterId
      ? { ...provider, baseUrl: normalizeBaseUrl(override) }
      : provider,
  )
}

function buildDefaultProviders(): FeedProvider[] {
  return FEED_CATALOG.map(catalogToProvider)
}

export const FEED_PROVIDERS: FeedProvider[] = applyLegacyStreamCenterOverride(
  parseProvidersFromEnv() ?? buildDefaultProviders(),
)

export function getProviderById(id: string): FeedProvider | undefined {
  return FEED_PROVIDERS.find((provider) => provider.id === id)
}

export function getDefaultFeedIds(): FeedId[] {
  return FEED_CATALOG.map((feed) => feed.id)
}

export function providerUsesSportSelector(provider: FeedProvider): boolean {
  return provider.kind === 'streamcenter'
}
