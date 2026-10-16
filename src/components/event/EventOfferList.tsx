import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { fadeUp, springSnappy, staggerContainer } from '../../motion/presets'
import { buildWatchPath } from '../../routes/paths'
import type { CatalogMatch } from '../../types/catalog'
import { formatMatchDate } from '../../utils/date'

interface EventOfferListProps {
  offers: CatalogMatch[]
}

function canWatch(match: CatalogMatch): boolean {
  return (
    match.playback.kind === 'trendy48' ||
    (match.playback.kind === 'streamcenter' && match.sources.length > 0)
  )
}

export function EventOfferList({ offers }: EventOfferListProps) {
  return (
    <motion.ul
      className="event-offers"
      variants={staggerContainer}
      initial="hidden"
      animate="visible"
    >
      {offers.map((match) => {
        const watchable = canWatch(match)
        return (
          <motion.li
            key={match.key}
            className="event-offer"
            variants={fadeUp}
            whileHover={{ x: 4, transition: springSnappy }}
          >
            <div className="event-offer__info">
              <span className="event-offer__feed">{match.providerName}</span>
              <h3 className="event-offer__title">{match.title}</h3>
              <p className="event-offer__meta">
                {match.category} · {formatMatchDate(match.date)}
                {match.popular ? ' · Popular' : ''}
                {match.manual ? ' · Curated' : ''}
              </p>
            </div>
            {watchable ? (
              <Link
                to={buildWatchPath(match)}
                state={{ match }}
                className="btn btn--secondary event-offer__watch"
              >
                Watch
              </Link>
            ) : (
              <span className="event-offer__unavailable">No stream</span>
            )}
          </motion.li>
        )
      })}
    </motion.ul>
  )
}
