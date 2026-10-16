export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="state state--loading panel" role="status" aria-live="polite">
      <span className="spinner" aria-hidden />
      <span>{label}</span>
    </div>
  )
}
