import type { CatalogMatch } from '../../types/catalog'
import { formatCategoryLabel } from '../../utils/category'
import { MatchCard } from './MatchCard'

interface MatchGridProps {
  matches: CatalogMatch[]
  categoryLabels: Map<string, string>
}

export function MatchGrid({ matches, categoryLabels }: MatchGridProps) {
  return (
    <ul className="match-grid">
      {matches.map((match) => (
        <li key={match.key}>
          <MatchCard
            match={match}
            sportName={
              categoryLabels.get(match.category) ??
              formatCategoryLabel(match.category)
            }
          />
        </li>
      ))}
    </ul>
  )
}
