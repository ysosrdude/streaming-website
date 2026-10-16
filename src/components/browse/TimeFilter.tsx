import { motion } from 'motion/react'
import { Link } from 'react-router-dom'
import { springSnappy } from '../../motion/presets'
import { BUILTIN_SELECTORS, homePath } from '../../routes/paths'
import type { BuiltinMatchSelector } from '../../types/api'

interface TimeFilterProps {
  active: BuiltinMatchSelector
  sportId?: string | null
}

export function TimeFilter({ active, sportId }: TimeFilterProps) {
  return (
    <nav className="filter-nav" aria-label="Time range">
      <div className="segmented" role="tablist">
        {BUILTIN_SELECTORS.map((item) => {
          const to = homePath(item.id, sportId)
          const isActive = active === item.id

          return (
            <Link
              key={item.id}
              to={to}
              className={`segmented__item${isActive ? ' segmented__item--active' : ''}`}
              role="tab"
              aria-selected={isActive}
            >
              {isActive ? (
                <motion.span
                  layoutId="time-range-indicator"
                  className="segmented__indicator"
                  transition={springSnappy}
                  aria-hidden
                />
              ) : null}
              {item.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
