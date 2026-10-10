import type { ProviderFailure } from '../../providers/aggregate'

export function ProviderWarnings({ failures }: { failures: ProviderFailure[] }) {
  if (failures.length === 0) return null

  return (
    <div className="provider-warnings" role="status">
      {failures.map((failure) => (
        <p key={failure.providerId}>
          <strong>{failure.providerName}</strong> could not be loaded:{' '}
          {failure.error.message}
        </p>
      ))}
    </div>
  )
}
