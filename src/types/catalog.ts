import type { FeedKind } from '../feeds'
import type { MatchSource, MatchTeams } from './api'

export interface CatalogMatch {
  providerId: string
  providerName: string
  /** API host used for artwork (StreamCenter badges/posters). */
  apiBaseUrl?: string
  id: string
  key: string
  title: string
  category: string
  date: number
  popular: boolean
  manual?: boolean
  poster?: string
  teams?: MatchTeams
  sources: MatchSource[]
  playback: StreamCenterPlayback | Trendy48Playback
}

export interface StreamCenterPlayback {
  kind: Extract<FeedKind, 'streamcenter'>
}

export interface Trendy48Playback {
  kind: Extract<FeedKind, 'trendy48'>
  watchUrl: string
}

export interface CatalogSport {
  id: string
  name: string
  providerId: string
}
