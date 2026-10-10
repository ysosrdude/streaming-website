import { Link } from 'react-router-dom'
import { buildEventPath } from '../../routes/paths'
import type { CatalogMatch } from '../../types/catalog'
import { posterImageUrl } from '../../utils/assets'
import { formatMatchDate, isLiveWindow } from '../../utils/date'
import { TeamBadge } from './TeamBadge'

interface MatchCardProps {
  match: CatalogMatch
  sportName?: string
}

export function MatchCard({ match, sportName }: MatchCardProps) {
  const poster = posterImageUrl(match.poster, match.apiBaseUrl)
  const canWatch =
    match.playback.kind === 'trendy48' ||
    (match.playback.kind === 'streamcenter' && match.sources.length > 0)
  const live = match.date === 0 || isLiveWindow(match.date)
  const eventTo = canWatch ? buildEventPath(match) : '#'

  return (
    <article className="match-card">
      <Link to={eventTo} state={{ match }} className="match-card__link">
        <div className="match-card__media">
          {poster ? (
            <img src={poster} alt="" loading="lazy" decoding="async" />
          ) : (
            <div className="match-card__placeholder" aria-hidden>
              {match.teams?.home && match.teams?.away ? (
                <div className="match-card__versus">
                  <TeamBadge
                    badgeId={match.teams.home.badge}
                    name={match.teams.home.name}
                    apiBaseUrl={match.apiBaseUrl}
                    size="sm"
                  />
                  <span>vs</span>
                  <TeamBadge
                    badgeId={match.teams.away.badge}
                    name={match.teams.away.name}
                    apiBaseUrl={match.apiBaseUrl}
                    size="sm"
                  />
                </div>
              ) : (
                <span className="match-card__initial">
                  {match.title.slice(0, 1)}
                </span>
              )}
            </div>
          )}
          <span className="match-card__feed">{match.providerName}</span>
          {live ? <span className="match-card__live">Live</span> : null}
          {match.popular ? (
            <span className="match-card__popular">Popular</span>
          ) : null}
        </div>
        <div className="match-card__body">
          <p className="match-card__meta">
            {sportName ?? match.category} · {formatMatchDate(match.date)}
            {match.manual ? ' · Curated' : ''}
          </p>
          <h3 className="match-card__title">{match.title}</h3>
          {match.teams?.home && match.teams?.away ? (
            <p className="match-card__teams">
              {match.teams.home.name} vs {match.teams.away.name}
            </p>
          ) : null}
        </div>
      </Link>
    </article>
  )
}
