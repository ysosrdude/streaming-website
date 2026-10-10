import type { Stream } from '../../types/api'

interface StreamPickerProps {
  streams: Stream[]
  selectedId: string | null
  onSelect: (stream: Stream) => void
}

export function StreamPicker({
  streams,
  selectedId,
  onSelect,
}: StreamPickerProps) {
  if (streams.length <= 1) return null

  return (
    <div className="stream-picker">
      <p className="stream-picker__label">Available streams</p>
      <ul className="stream-picker__list">
        {streams.map((stream) => {
          const active = stream.id === selectedId
          return (
            <li key={stream.id}>
              <button
                type="button"
                className={`stream-option${active ? ' stream-option--active' : ''}`}
                onClick={() => onSelect(stream)}
                aria-pressed={active}
              >
                <span className="stream-option__no">#{stream.streamNo}</span>
                <span className="stream-option__lang">{stream.language}</span>
                {stream.hd ? <span className="stream-option__hd">HD</span> : null}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
