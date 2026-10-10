import { useEffect, useState } from 'react'
import { ApiError } from '../api/errors'

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  status: AsyncStatus
  data: T | undefined
  error: Error | undefined
  refetch: () => void
}

export function useAsyncData<T>(
  key: string,
  loader: (signal: AbortSignal) => Promise<T>,
  enabled = true,
): AsyncState<T> {
  const [status, setStatus] = useState<AsyncStatus>('idle')
  const [data, setData] = useState<T | undefined>()
  const [error, setError] = useState<Error | undefined>()
  const [tick, setTick] = useState(0)

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      return
    }

    const controller = new AbortController()
    setStatus('loading')
    setError(undefined)

    loader(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result)
          setStatus('success')
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const normalized =
          err instanceof Error ? err : new Error('Something went wrong')
        setError(normalized)
        setStatus('error')
      })

    return () => controller.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by `key`; loader is stable per call site
  }, [key, enabled, tick])

  return {
    status,
    data,
    error,
    refetch: () => setTick((n) => n + 1),
  }
}

export function getErrorMessage(error: Error | undefined): string {
  if (!error) return 'Unknown error'
  if (error instanceof ApiError) {
    if (error.status === 429 && error.retryAfter) {
      return `Rate limited. Try again in ${error.retryAfter}s.`
    }
    if (error.status === 404) return 'Not found.'
    return error.message
  }
  return error.message
}
