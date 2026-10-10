import { getErrorMessage } from '../../hooks/useAsyncData'

interface ErrorStateProps {
  error: Error
  onRetry?: () => void
}

export function ErrorState({ error, onRetry }: ErrorStateProps) {
  return (
    <div className="state state--error" role="alert">
      <p>{getErrorMessage(error)}</p>
      {onRetry ? (
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          Try again
        </button>
      ) : null}
    </div>
  )
}
