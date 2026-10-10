import { useCallback, useMemo } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ProviderMultiselect } from '../components/browse/ProviderMultiselect'
import { ProviderWarnings } from '../components/browse/ProviderWarnings'
import { SportFilter } from '../components/browse/SportFilter'
import { TimeFilter } from '../components/browse/TimeFilter'
import { MatchGrid } from '../components/matches/MatchGrid'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { useProviderSelection } from '../context/ProviderSelectionContext'
import { useAsyncData } from '../hooks/useAsyncData'
import {
  aggregateMatches,
  aggregatePopular,
  aggregateSports,
} from '../providers/aggregate'
import { getProviderById, providerUsesSportSelector } from '../feeds'
import type { BrowseQuery } from '../providers/adapters'
import type { BuiltinMatchSelector } from '../types/api'
import { formatCategoryLabel } from '../utils/category'

const VALID_VIEWS = new Set<string>(['live', 'all-today', 'all'])

function resolveTimeSelector(viewParam: string | null): BuiltinMatchSelector {
  if (viewParam && VALID_VIEWS.has(viewParam)) {
    return viewParam as BuiltinMatchSelector
  }
  return 'live'
}

export function BrowsePage() {
  const { sportId: sportIdParam } = useParams()
  const [searchParams] = useSearchParams()
  const { selectedIds } = useProviderSelection()

  const timeSelector = resolveTimeSelector(searchParams.get('view'))
  const sportId = sportIdParam ?? null

  const browseQuery: BrowseQuery = useMemo(
    () => ({ timeSelector, sportId }),
    [timeSelector, sportId],
  )

  const providerKey = selectedIds.join(',')

  const sportsQuery = useAsyncData(
    `sports:${providerKey}`,
    useCallback(
      (signal) =>
        aggregateSports(selectedIds, signal).then((result) => result),
      [selectedIds],
    ),
  )

  const matchesQuery = useAsyncData(
    `matches:${providerKey}:${timeSelector}:${sportId ?? 'all'}`,
    useCallback(
      (signal) =>
        aggregateMatches(selectedIds, browseQuery, signal).then(
          (result) => result,
        ),
      [selectedIds, browseQuery],
    ),
  )

  const popularQuery = useAsyncData(
    `popular:${providerKey}:${timeSelector}:${sportId ?? 'all'}`,
    useCallback(
      (signal) =>
        aggregatePopular(selectedIds, browseQuery, signal).then(
          (result) => result,
        ),
      [selectedIds, browseQuery],
    ),
  )

  const categoryLabels = useMemo(() => {
    const map = new Map<string, string>()
    for (const sport of sportsQuery.data?.sports ?? []) {
      map.set(sport.id, sport.name)
    }
    return map
  }, [sportsQuery.data?.sports])

  const matches = matchesQuery.data?.matches ?? []
  const popular = popularQuery.data?.matches ?? []

  const soleProvider =
    selectedIds.length === 1 ? getProviderById(selectedIds[0]) : undefined
  const sportOnlyStreamCenter =
    Boolean(sportId) &&
    soleProvider !== undefined &&
    providerUsesSportSelector(soleProvider)

  const sectionTitle = sportId
    ? (categoryLabels.get(sportId) ?? formatCategoryLabel(sportId))
    : timeSelector === 'live'
      ? 'Live now'
      : timeSelector === 'all-today'
        ? 'Today'
        : 'All events'

  const loading =
    sportsQuery.status === 'loading' ||
    matchesQuery.status === 'loading' ||
    popularQuery.status === 'loading'

  return (
    <div className="browse-page">
      <section className="browse-hero">
        <h1>Watch live sports</h1>
        <p>
          Choose one or more feeds, browse events, and open a stream in the
          player.
        </p>
      </section>

      <ProviderMultiselect />

      <ProviderWarnings
        failures={[
          ...(sportsQuery.data?.failures ?? []),
          ...(matchesQuery.data?.failures ?? []),
          ...(popularQuery.data?.failures ?? []),
        ]}
      />

      {sportsQuery.status === 'loading' ? (
        <LoadingState label="Loading sports…" />
      ) : sportsQuery.status === 'error' && sportsQuery.error ? (
        <ErrorState error={sportsQuery.error} onRetry={sportsQuery.refetch} />
      ) : (
        <>
          {sportOnlyStreamCenter ? (
            <p className="browse-note">
              StreamCenter shows the full schedule for this sport. Use{' '}
              <strong>All sports</strong> for Live / Today / All, or add Trendy48
              to combine feeds.
            </p>
          ) : sportId ? (
            <p className="browse-note">
              Filtering by category across selected feeds. Use{' '}
              <strong>All sports</strong> for global Live / Today / All lists.
            </p>
          ) : (
            <TimeFilter active={timeSelector} sportId={sportId} />
          )}
          <SportFilter
            sports={sportsQuery.data?.sports ?? []}
            activeSportId={sportId}
            timeSelector={timeSelector}
          />
        </>
      )}

      {popularQuery.status === 'success' && popular.length > 0 ? (
        <section className="content-section">
          <div className="section-heading">
            <h2>Popular</h2>
          </div>
          <MatchGrid matches={popular} categoryLabels={categoryLabels} />
        </section>
      ) : null}

      <section className="content-section">
        <div className="section-heading">
          <h2>{sectionTitle}</h2>
          {matchesQuery.status === 'success' ? (
            <span className="section-heading__count">{matches.length} events</span>
          ) : null}
        </div>

        {loading ? <LoadingState label="Loading matches…" /> : null}
        {matchesQuery.status === 'error' && matchesQuery.error ? (
          <ErrorState error={matchesQuery.error} onRetry={matchesQuery.refetch} />
        ) : null}
        {matchesQuery.status === 'success' && matches.length === 0 && !loading ? (
          <EmptyState
            title="No matches here"
            description="Try another feed, sport, or time range."
          />
        ) : null}
        {matchesQuery.status === 'success' && matches.length > 0 ? (
          <MatchGrid matches={matches} categoryLabels={categoryLabels} />
        ) : null}
      </section>
    </div>
  )
}
