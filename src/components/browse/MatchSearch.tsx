import { SEARCH_MIN_LENGTH } from '../../utils/matchSearch'

interface MatchSearchProps {
  value: string
  onChange: (value: string) => void
  resultCount?: number
  searching?: boolean
}

export function MatchSearch({
  value,
  onChange,
  resultCount,
  searching,
}: MatchSearchProps) {
  const trimmed = value.trim()
  const showMeta = trimmed.length >= SEARCH_MIN_LENGTH

  return (
    <div className="match-search">
      <label className="match-search__label" htmlFor="match-search-input">
        Search events
      </label>
      <div className="match-search__field">
        <input
          id="match-search-input"
          className="match-search__input"
          type="search"
          name="q"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Team, league, or event name"
          autoComplete="off"
          enterKeyHint="search"
          aria-describedby="match-search-hint"
        />
        {value ? (
          <button
            type="button"
            className="match-search__clear"
            onClick={() => onChange('')}
            aria-label="Clear search"
          >
            Clear
          </button>
        ) : null}
      </div>
      <p id="match-search-hint" className="match-search__hint">
        {showMeta && searching
          ? 'Searching catalogs from your selected feeds…'
          : showMeta && resultCount !== undefined
            ? `${resultCount} match${resultCount === 1 ? '' : 'es'}`
            : 'No server search API — matches titles and teams in loaded feeds.'}
      </p>
    </div>
  )
}
