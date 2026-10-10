import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link, useLocation, useParams, useSearchParams } from 'react-router-dom'
import { createStreamCenterApi } from '../api/streamcenter'
import { createTrendy48Api } from '../api/trendy48'
import { TeamBadge } from '../components/matches/TeamBadge'
import { EmbedPlayer } from '../components/watch/EmbedPlayer'
import { MirrorPicker } from '../components/watch/MirrorPicker'
import { StreamPicker } from '../components/watch/StreamPicker'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { useAsyncData } from '../hooks/useAsyncData'
import { getProviderById } from '../feeds'
import { homePath, parseStreamCenterWatchSearch } from '../routes/paths'
import type { MatchSource, Stream } from '../types/api'
import type { CatalogMatch } from '../types/catalog'
import { formatMatchDate } from '../utils/date'
import { buildTrendy48WatchUrl } from '../utils/trendy48'
import { toTrendy48Catalog } from '../providers/adapters'

function mirrorKey(mirror: MatchSource): string {
  return `${mirror.source}:${mirror.id}`
}

export function WatchPage() {
  const { providerId, matchId: matchIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const matchFromState = (location.state as { match?: CatalogMatch } | null)?.match
  const provider = providerId ? getProviderById(providerId) : undefined

  const matchId = matchIdParam ?? ''
  const streamCenterParams = parseStreamCenterWatchSearch(searchParams)

  const title =
    searchParams.get('title') ??
    matchFromState?.title ??
    (matchId ? decodeURIComponent(matchId) : 'Watch')

  const playbackKind =
    matchFromState?.playback.kind ?? provider?.kind

  const trendy48WatchUrl =
    matchFromState?.playback.kind === 'trendy48'
      ? matchFromState.playback.watchUrl
      : undefined

  const source =
    streamCenterParams?.source ??
    matchFromState?.sources[0]?.source
  const streamGroupId =
    streamCenterParams?.group ??
    matchFromState?.sources[0]?.id ??
    matchId

  const providerBase = provider?.baseUrl ?? matchFromState?.apiBaseUrl

  const streamsQuery = useAsyncData(
    `streams:${providerId}:${source}:${streamGroupId}`,
    useCallback(
      (signal) => {
        if (playbackKind !== 'streamcenter' || !providerBase) {
          return Promise.resolve([] as Stream[])
        }
        if (!source || !streamGroupId) {
          return Promise.resolve([] as Stream[])
        }
        return createStreamCenterApi(providerBase).resolveStreams(
          source,
          streamGroupId,
          signal,
        )
      },
      [playbackKind, providerBase, source, streamGroupId],
    ),
    playbackKind === 'streamcenter' && Boolean(source && streamGroupId),
  )

  const fallbackMatchQuery = useAsyncData(
    `match:${providerId}:${matchId}`,
    useCallback(
      async (signal) => {
        if (matchFromState || !provider || !matchId) return null
        if (provider.kind === 'trendy48') {
          const row = await createTrendy48Api(provider.baseUrl).getMatch(
            matchId,
            signal,
          )
          return toTrendy48Catalog(provider, row)
        }
        return null
      },
      [matchFromState, provider, matchId],
    ),
    !matchFromState && provider?.kind === 'trendy48' && Boolean(matchId),
  )

  const match = matchFromState ?? fallbackMatchQuery.data ?? null

  const [selectedStreamId, setSelectedStreamId] = useState<string | null>(null)
  const [selectedMirrorKey, setSelectedMirrorKey] = useState<string | null>(
    null,
  )

  const streams = streamsQuery.data ?? []

  const selectedStream = useMemo(() => {
    if (!streams.length) return null
    if (selectedStreamId) {
      return streams.find((s) => s.id === selectedStreamId) ?? streams[0]
    }
    return streams[0]
  }, [streams, selectedStreamId])

  const mirrors = match?.sources ?? []
  const selectedMirror = useMemo(() => {
    if (!mirrors.length) return null
    if (selectedMirrorKey) {
      const found = mirrors.find((m) => mirrorKey(m) === selectedMirrorKey)
      return found ?? mirrors[0]
    }
    return mirrors[0]
  }, [mirrors, selectedMirrorKey])

  const trendy48Embed = useMemo(() => {
    const baseUrl =
      match?.playback.kind === 'trendy48'
        ? match.playback.watchUrl
        : trendy48WatchUrl
    if (!baseUrl) return null
    if (!selectedMirror) return baseUrl
    return buildTrendy48WatchUrl(baseUrl, {
      source: selectedMirror.source,
    })
  }, [match, trendy48WatchUrl, selectedMirror])

  useEffect(() => {
    setSelectedStreamId(null)
    setSelectedMirrorKey(null)
  }, [providerId, matchId, source, streamGroupId])

  if (!providerId || !matchId) {
    return (
      <div className="watch-page">
        <ErrorState error={new Error('Invalid watch link.')} />
        <Link to={homePath('live')} className="btn btn--secondary">
          Back to browse
        </Link>
      </div>
    )
  }

  if (!provider) {
    return (
      <div className="watch-page">
        <ErrorState error={new Error(`Unknown feed: ${providerId}`)} />
        <Link to={homePath('live')} className="btn btn--secondary">
          Back to browse
        </Link>
      </div>
    )
  }

  if (!playbackKind) {
    return (
      <div className="watch-page">
        <ErrorState error={new Error('Could not determine how to play this feed.')} />
        <Link to={homePath('live')} className="btn btn--secondary">
          Back to browse
        </Link>
      </div>
    )
  }

  const isStreamCenter = playbackKind === 'streamcenter'

  if (isStreamCenter && (!source || !streamGroupId)) {
    return (
      <div className="watch-page">
        <ErrorState
          error={new Error('Missing stream parameters. Open a match from browse.')}
        />
        <Link to={homePath('live')} className="btn btn--secondary">
          Back to browse
        </Link>
      </div>
    )
  }

  return (
    <div className="watch-page">
      <div className="watch-page__toolbar">
        <Link to={homePath('live')} className="btn btn--ghost">
          ← Back
        </Link>
        <span className="watch-page__feed">{provider.name}</span>
      </div>

      <header className="watch-header">
        <div>
          <h1>{title}</h1>
          {match ? (
            <p className="watch-header__meta">
              {match.category} · {formatMatchDate(match.date)}
            </p>
          ) : null}
        </div>
        {match?.teams?.home && match?.teams?.away ? (
          <div className="watch-header__teams">
            <TeamBadge
              badgeId={match.teams.home.badge}
              name={match.teams.home.name}
              apiBaseUrl={match.apiBaseUrl}
            />
            <span>vs</span>
            <TeamBadge
              badgeId={match.teams.away.badge}
              name={match.teams.away.name}
              apiBaseUrl={match.apiBaseUrl}
            />
          </div>
        ) : null}
      </header>

      {isStreamCenter && streamsQuery.status === 'loading' ? (
        <LoadingState label="Resolving streams…" />
      ) : null}
      {isStreamCenter && streamsQuery.status === 'error' && streamsQuery.error ? (
        <ErrorState error={streamsQuery.error} onRetry={streamsQuery.refetch} />
      ) : null}

      {isStreamCenter &&
      streamsQuery.status === 'success' &&
      streams.length === 0 ? (
        <ErrorState
          error={new Error('No streams are available for this event right now.')}
          onRetry={streamsQuery.refetch}
        />
      ) : null}

      {isStreamCenter && selectedStream ? (
        <>
          <EmbedPlayer embedUrl={selectedStream.embedUrl} title={title} />
          <StreamPicker
            streams={streams}
            selectedId={selectedStream.id}
            onSelect={(stream) => setSelectedStreamId(stream.id)}
          />
          {selectedStream.webUrl ? (
            <p className="watch-fallback">
              <a href={selectedStream.webUrl} target="_blank" rel="noreferrer">
                Open in StreamCenter
              </a>
            </p>
          ) : null}
        </>
      ) : null}

      {!isStreamCenter ? (
        <>
          {fallbackMatchQuery.status === 'loading' ? (
            <LoadingState label="Loading event…" />
          ) : null}
          {trendy48Embed ? (
            <EmbedPlayer embedUrl={trendy48Embed} title={title} />
          ) : (
            <ErrorState error={new Error('Could not load watch URL for this event.')} />
          )}
          <MirrorPicker
            mirrors={mirrors}
            selectedKey={selectedMirror ? mirrorKey(selectedMirror) : null}
            onSelect={(mirror) => setSelectedMirrorKey(mirrorKey(mirror))}
          />
        </>
      ) : null}

      {isStreamCenter && match && match.sources.length > 1 ? (
        <div className="source-list">
          <p className="source-list__label">Provider groups</p>
          <ul>
            {match.sources.map((src) => (
              <li key={`${src.source}-${src.id}`}>
                <Link
                  to={`/watch/${encodeURIComponent(providerId)}/${encodeURIComponent(matchId)}?source=${encodeURIComponent(src.source)}&group=${encodeURIComponent(src.id)}&title=${encodeURIComponent(title)}`}
                  state={{ match }}
                >
                  {src.source}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  )
}
