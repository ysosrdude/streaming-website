import { createApiClient } from './createClient'
import type { Match, MatchSelector, Sport, Stream } from '../types/api'

export function createStreamCenterApi(baseUrl: string) {
  const client = createApiClient(baseUrl)

  return {
    listSports(signal?: AbortSignal): Promise<Sport[]> {
      return client.get<Sport[]>('/api/sports', { signal })
    },

    listMatches(selector: MatchSelector, signal?: AbortSignal): Promise<Match[]> {
      return client.get<Match[]>(`/api/matches/${encodeURIComponent(selector)}`, {
        signal,
      })
    },

    listPopularMatches(
      selector: MatchSelector,
      signal?: AbortSignal,
    ): Promise<Match[]> {
      return client.get<Match[]>(
        `/api/matches/${encodeURIComponent(selector)}/popular`,
        { signal },
      )
    },

    resolveStreams(
      source: string,
      matchId: string,
      signal?: AbortSignal,
    ): Promise<Stream[]> {
      return client.get<Stream[]>(
        `/api/stream/${encodeURIComponent(source)}/${encodeURIComponent(matchId)}`,
        { signal },
      )
    },
  }
}
