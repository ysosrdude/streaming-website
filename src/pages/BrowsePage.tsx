import { useCallback, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { ProviderMultiselect } from '../components/browse/ProviderMultiselect'
import { ProviderWarnings } from '../components/browse/ProviderWarnings'
import { SportFilter } from '../components/browse/SportFilter'
import { MatchSearch } from '../components/browse/MatchSearch'
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
import {
  filterCatalogMatches,
  SEARCH_MIN_LENGTH,
} from '../utils/matchSearch'
import { discoverCatalogMatches } from '../providers/discovery'
import { matchSportCategory } from '../utils/eventMatch'
import { timeSelectorLabel } from '../utils/timeSelectorLabel'

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
  const [searchQuery, setSearchQuery] = useState('')

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

  const searchActive =
    searchQuery.trim().length >= SEARCH_MIN_LENGTH && selectedIds.length > 0

  const discoveryQuery = useAsyncData(
    `discovery:${providerKey}`,
    useCallback(
      (signal) => discoverCatalogMatches(selectedIds, signal),
      [selectedIds],
    ),
    searchActive,
  )

  const displayedMatches = useMemo(() => {
    const trimmed = searchQuery.trim()
    if (trimmed.length < SEARCH_MIN_LENGTH) return matches

    let pool = discoveryQuery.data ?? matches
    if (sportId) {
      pool = pool.filter((match) => matchSportCategory(match.category, sportId))
    }
    return filterCatalogMatches(pool, trimmed, categoryLabels)
  }, [
    searchQuery,
    matches,
    discoveryQuery.data,
    sportId,
    categoryLabels,
  ])

  const soleProvider =
    selectedIds.length === 1 ? getProviderById(selectedIds[0]) : undefined
  const sportOnlyStreamCenter =
    Boolean(sportId) &&
    soleProvider !== undefined &&
    providerUsesSportSelector(soleProvider)

  const timeLabel = timeSelectorLabel(timeSelector)
  const sectionTitle = sportId
    ? `${categoryLabels.get(sportId) ?? formatCategoryLabel(sportId)} · ${timeLabel}`
    : timeLabel

  const scheduleTitle = searchActive
    ? `Results for “${searchQuery.trim()}”`
    : sectionTitle

  const scheduleInitialLoad = searchActive
    ? discoveryQuery.status === 'loading' && discoveryQuery.data === undefined
    : matchesQuery.status === 'loading' && matchesQuery.data === undefined

  const scheduleSettled = searchActive
    ? discoveryQuery.status === 'success' || discoveryQuery.status === 'error'
    : matchesQuery.status === 'success' || matchesQuery.status === 'error'

  return (
    <div className="browse-page">
      <header className="browse-hero">
        <div className="browse-hero__ticker" aria-hidden>
          <span className="browse-hero__ticker-track">
            On air · multi-feed · open event · choose provider · on air ·
            multi-feed ·
          </span>
        </div>
        <div className="browse-hero__layout">
          <div className="browse-hero__copy">
            <p className="browse-hero__eyebrow">Transmission desk</p>
            <h1 className="browse-hero__title">
              What&apos;s
              <span className="browse-hero__title-accent"> on now</span>
            </h1>
            <p className="browse-hero__subtitle">
              Scan live boards from your feeds, jump into an event, and lock in
              where you watch.
            </p>
          </div>
          <div className="browse-hero__badge" aria-hidden>
            <span className="browse-hero__badge-label">Guide</span>
            <span className="browse-hero__badge-value">24/7</span>
          </div>
        </div>
      </header>

      <section className="panel panel--filters" aria-label="Filters">
        <MatchSearch
          value={searchQuery}
          onChange={setSearchQuery}
          resultCount={
            searchActive && discoveryQuery.status === 'success'
              ? displayedMatches.length
              : undefined
          }
          searching={searchActive && discoveryQuery.isFetching}
        />

        <ProviderMultiselect />

        <ProviderWarnings
          failures={[
            ...(sportsQuery.data?.failures ?? []),
            ...(matchesQuery.data?.failures ?? []),
            ...(popularQuery.data?.failures ?? []),
          ]}
        />

        {sportsQuery.status === 'error' && sportsQuery.error ? (
          <ErrorState error={sportsQuery.error} onRetry={sportsQuery.refetch} />
        ) : (
          <div className="filter-stack">
            <TimeFilter active={timeSelector} sportId={sportId} />
            {sportOnlyStreamCenter ? (
              <p className="browse-note" role="note">
                StreamCenter lists this sport in full; Live / Today / All filter
                that list on your side.
              </p>
            ) : null}
            {sportId && !sportOnlyStreamCenter ? (
              <p className="browse-note" role="note">
                Filtered by sport across feeds.
              </p>
            ) : null}
            <SportFilter
              sports={sportsQuery.data?.sports ?? []}
              activeSportId={sportId}
              timeSelector={timeSelector}
            />
          </div>
        )}
      </section>

      {!searchActive && popular.length > 0 ? (
        <section className="content-section" aria-labelledby="popular-heading">
          <div className="section-heading">
            <h2 id="popular-heading">Popular</h2>
          </div>
          <MatchGrid matches={popular} categoryLabels={categoryLabels} />
        </section>
      ) : null}

      <section className="content-section" aria-labelledby="schedule-heading">
        <div className="section-heading">
          <h2 id="schedule-heading">{scheduleTitle}</h2>
          {scheduleSettled || matchesQuery.data ? (
            <span className="section-heading__count">
              {displayedMatches.length} events
            </span>
          ) : null}
        </div>

        {scheduleInitialLoad ? <LoadingState label="Loading matches…" /> : null}
        {searchActive && discoveryQuery.status === 'error' && discoveryQuery.error ? (
          <ErrorState
            error={discoveryQuery.error}
            onRetry={discoveryQuery.refetch}
          />
        ) : null}
        {!searchActive &&
        matchesQuery.status === 'error' &&
        matchesQuery.error ? (
          <ErrorState error={matchesQuery.error} onRetry={matchesQuery.refetch} />
        ) : null}
        {scheduleSettled &&
        displayedMatches.length === 0 &&
        !scheduleInitialLoad ? (
          <EmptyState
            title={searchActive ? 'No matches found' : 'No matches here'}
            description={
              searchActive
                ? 'Try another spelling, sport, or feed.'
                : 'Try another feed, sport, or time range.'
            }
          />
        ) : null}
        {!scheduleInitialLoad && displayedMatches.length > 0 ? (
          <MatchGrid
            matches={displayedMatches}
            categoryLabels={categoryLabels}
          />
        ) : null}
      </section>
    </div>
  )
}
