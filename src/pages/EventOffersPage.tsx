import { motion } from 'motion/react'
import { useCallback, useMemo } from 'react'
import { Link, useLocation, useSearchParams } from 'react-router-dom'
import { EventOfferList } from '../components/event/EventOfferList'
import { EmptyState } from '../components/ui/EmptyState'
import { ErrorState } from '../components/ui/ErrorState'
import { LoadingState } from '../components/ui/LoadingState'
import { useProviderSelection } from '../context/ProviderSelectionContext'
import { useAsyncData } from '../hooks/useAsyncData'
import { discoverCatalogMatches } from '../providers/discovery'
import { homePath } from '../routes/paths'
import type { CatalogMatch } from '../types/catalog'
import {
  eventSeedLabel,
  isSameEvent,
  parseEventSeed,
  seedFromMatch,
  type EventSeed,
} from '../utils/eventMatch'
import { formatMatchDate } from '../utils/date'
import { fadeUp, staggerContainer } from '../motion/presets'

export function EventOffersPage() {
  const { selectedIds } = useProviderSelection()
  const [searchParams] = useSearchParams()
  const location = useLocation()

  const seedFromState = (location.state as { match?: CatalogMatch } | null)?.match
  const seedFromQuery = parseEventSeed(searchParams)

  const seed: EventSeed | null = seedFromState
    ? seedFromMatch(seedFromState)
    : seedFromQuery

  const providerKey = selectedIds.join(',')

  const discoveryQuery = useAsyncData(
    `discovery:${providerKey}`,
    useCallback(
      (signal) => discoverCatalogMatches(selectedIds, signal),
      [selectedIds],
    ),
    Boolean(seed) && selectedIds.length > 0,
  )

  const offers = useMemo(() => {
    if (!seed) return []

    const pool = discoveryQuery.data ?? []
    const matched = pool.filter((match) => isSameEvent(match, seed))

    if (seedFromState) {
      const hasSeed = matched.some((m) => m.key === seedFromState.key)
      if (!hasSeed) {
        matched.push(seedFromState)
      }
    }

    return matched.sort((a, b) => {
      const provider = a.providerName.localeCompare(b.providerName)
      if (provider !== 0) return provider
      return a.title.localeCompare(b.title)
    })
  }, [seed, discoveryQuery.data, seedFromState])

  if (!seed) {
    return (
      <div className="event-page">
        <ErrorState
          error={
            new Error(
              'Missing event details. Open an event from the browse page.',
            )
          }
        />
        <Link to={homePath('live')} className="btn btn--secondary">
          Back to browse
        </Link>
      </div>
    )
  }

  const heading = eventSeedLabel(seed)

  return (
    <div className="event-page">
      <div className="event-page__toolbar">
        <Link to={homePath('live')} className="btn btn--ghost">
          ← Back
        </Link>
      </div>

      <motion.header
        className="event-page__header"
        variants={staggerContainer}
        initial="hidden"
        animate="visible"
      >
        <motion.h1 variants={fadeUp}>{heading}</motion.h1>
        <motion.p className="event-page__meta" variants={fadeUp}>
          {seed.category} · {formatMatchDate(seed.date)}
        </motion.p>
        <motion.p className="event-page__hint" variants={fadeUp}>
          Showing streams matched across {selectedIds.length} selected feed
          {selectedIds.length === 1 ? '' : 's'}. Pick a source to watch.
        </motion.p>
      </motion.header>

      {discoveryQuery.status === 'loading' ? (
        <LoadingState label="Finding streams across feeds…" />
      ) : null}
      {discoveryQuery.status === 'error' && discoveryQuery.error ? (
        <ErrorState error={discoveryQuery.error} onRetry={discoveryQuery.refetch} />
      ) : null}

      {discoveryQuery.status === 'success' && offers.length === 0 ? (
        <EmptyState
          title="No streams found"
          description="This event is not listed on the selected feeds right now. Try enabling more feeds or check again later."
        />
      ) : null}

      {offers.length > 0 ? (
        <>
          <p className="event-page__count">
            {offers.length} source{offers.length === 1 ? '' : 's'}
          </p>
          <EventOfferList offers={offers} />
        </>
      ) : null}
    </div>
  )
}
