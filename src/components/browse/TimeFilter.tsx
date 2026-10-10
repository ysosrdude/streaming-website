import { Link, useLocation } from 'react-router-dom'
import { BUILTIN_SELECTORS, homePath } from '../../routes/paths'
import type { BuiltinMatchSelector } from '../../types/api'

interface TimeFilterProps {
  active: BuiltinMatchSelector
  sportId?: string | null
}

export function TimeFilter({ active, sportId }: TimeFilterProps) {
  const location = useLocation()

  return (
    <nav className="filter-nav" aria-label="Time range">
      <ul className="filter-nav__list">
        {BUILTIN_SELECTORS.map((item) => {
          const to = homePath(item.id, sportId)
          const isActive =
            active === item.id &&
            (sportId
              ? location.pathname.startsWith('/sport/')
              : location.pathname === '/')

          return (
            <li key={item.id}>
              <Link
                to={to}
                className={`filter-pill${isActive ? ' filter-pill--active' : ''}`}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
