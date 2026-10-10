export interface Sport {
  id: string
  name: string
}

export interface MatchTeam {
  name: string
  badge: string
}

export interface MatchTeams {
  home?: MatchTeam
  away?: MatchTeam
}

export interface MatchSource {
  source: string
  id: string
}

export interface Match {
  id: string
  title: string
  category: string
  date: number
  poster?: string
  popular: boolean
  teams?: MatchTeams
  sources: MatchSource[]
}

export interface Stream {
  id: string
  streamNo: number
  language: string
  hd: boolean
  embedUrl: string
  webUrl?: string
  source: string
}

export interface ApiErrorBody {
  error: {
    code: string
    requestId: string
  }
}

/** Built-in match list selectors (see OpenAPI `Selector` parameter). */
export type BuiltinMatchSelector = 'all' | 'all-today' | 'live'

export type MatchSelector = BuiltinMatchSelector | (string & {})
