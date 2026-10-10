import { Link } from 'react-router-dom'
import { homePath } from '../../routes/paths'
import type { BuiltinMatchSelector } from '../../types/api'
import type { CatalogSport } from '../../types/catalog'

interface SportFilterProps {
  sports: CatalogSport[]
  activeSportId?: string | null
  timeSelector: BuiltinMatchSelector
}

export function SportFilter({
  sports,
  activeSportId,
  timeSelector,
}: SportFilterProps) {
  const allActive = !activeSportId

  return (
    <nav className="sport-filter" aria-label="Sports">
      <ul className="sport-filter__list">
        <li>
          <Link
            to={homePath(timeSelector)}
            className={`sport-chip${allActive ? ' sport-chip--active' : ''}`}
            aria-current={allActive ? 'true' : undefined}
          >
            All sports
          </Link>
        </li>
        {sports.map((sport) => {
          const isActive = activeSportId === sport.id
          return (
            <li key={sport.id}>
              <Link
                to={homePath(timeSelector, sport.id)}
                className={`sport-chip${isActive ? ' sport-chip--active' : ''}`}
                aria-current={isActive ? 'true' : undefined}
              >
                {sport.name}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
