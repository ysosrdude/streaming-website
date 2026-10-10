import type { BuiltinMatchSelector } from '../types/api'
import { createApiClient } from './createClient'

export interface Trendy48Source {
  source: string
  id: string
  streamNo?: number
  hd?: boolean
  language?: string
}

export interface Trendy48Match {
  id: string
  title: string
  category: string
  date: number
  popular: boolean
  manual: boolean
  sources: Trendy48Source[]
  watch_url: string
}

export type Trendy48Categories = Record<string, number>

const LIST_PATHS: Record<BuiltinMatchSelector, string> = {
  live: '/matches/live',
  'all-today': '/matches/all-today',
  all: '/matches/all',
}

export function createTrendy48Api(baseUrl: string) {
  const client = createApiClient(baseUrl)

  return {
    listMatches(selector: BuiltinMatchSelector, signal?: AbortSignal) {
      return client.get<Trendy48Match[]>(LIST_PATHS[selector], { signal })
    },

    listPopular(signal?: AbortSignal) {
      return client.get<Trendy48Match[]>('/matches/popular', { signal })
    },

    listCategories(signal?: AbortSignal) {
      return client.get<Trendy48Categories>('/categories', { signal })
    },

    getMatch(id: string, signal?: AbortSignal) {
      return client.get<Trendy48Match>(`/match/${encodeURIComponent(id)}`, {
        signal,
      })
    },
  }
}
