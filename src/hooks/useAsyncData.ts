import { useEffect, useRef, useState } from 'react'
import { ApiError } from '../api/errors'

export type AsyncStatus = 'idle' | 'loading' | 'success' | 'error'

export interface AsyncState<T> {
  status: AsyncStatus
  data: T | undefined
  error: Error | undefined
  /** True while a request is in flight (including background refetches). */
  isFetching: boolean
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
  const [isFetching, setIsFetching] = useState(false)
  const [tick, setTick] = useState(0)
  const dataRef = useRef(data)
  const keyRef = useRef(key)
  dataRef.current = data

  useEffect(() => {
    if (!enabled) {
      setStatus('idle')
      setIsFetching(false)
      return
    }

    const controller = new AbortController()
    const keyChanged = keyRef.current !== key
    keyRef.current = key
    setIsFetching(true)
    setError(undefined)
    if (keyChanged) {
      setData(undefined)
      setStatus('loading')
    } else {
      setStatus((current) =>
        dataRef.current === undefined ? 'loading' : current,
      )
    }

    loader(controller.signal)
      .then((result) => {
        if (!controller.signal.aborted) {
          setData(result)
          setStatus('success')
          setIsFetching(false)
        }
      })
      .catch((err: unknown) => {
        if (controller.signal.aborted) return
        const normalized =
          err instanceof Error ? err : new Error('Something went wrong')
        setError(normalized)
        setStatus('error')
        setIsFetching(false)
      })

    return () => {
      controller.abort()
      setIsFetching(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps -- keyed by `key`; loader is stable per call site
  }, [key, enabled, tick])

  return {
    status,
    data,
    error,
    isFetching,
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
