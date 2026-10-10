import type { MatchSource } from '../../types/api'

interface MirrorPickerProps {
  mirrors: MatchSource[]
  selectedKey: string | null
  onSelect: (mirror: MatchSource) => void
  labels?: Map<string, string>
}

function mirrorKey(mirror: MatchSource): string {
  return `${mirror.source}:${mirror.id}`
}

export function MirrorPicker({
  mirrors,
  selectedKey,
  onSelect,
  labels,
}: MirrorPickerProps) {
  if (mirrors.length <= 1) return null

  return (
    <div className="stream-picker">
      <p className="stream-picker__label">Mirrors</p>
      <ul className="stream-picker__list">
        {mirrors.map((mirror) => {
          const key = mirrorKey(mirror)
          const active = key === selectedKey
          const label = labels?.get(key) ?? mirror.source
          return (
            <li key={key}>
              <button
                type="button"
                className={`stream-option${active ? ' stream-option--active' : ''}`}
                onClick={() => onSelect(mirror)}
                aria-pressed={active}
              >
                <span className="stream-option__lang">{label}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
