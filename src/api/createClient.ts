import { parseApiError } from './errors'

type RequestOptions = {
  signal?: AbortSignal
}

export function createApiClient(baseUrl: string) {
  const root = baseUrl.replace(/\/+$/, '')

  async function get<T>(path: string, options?: RequestOptions): Promise<T> {
    const url = path.startsWith('http') ? path : `${root}${path.startsWith('/') ? path : `/${path}`}`

    const response = await fetch(url, {
      signal: options?.signal,
      headers: { Accept: 'application/json' },
    })

    if (!response.ok) {
      throw await parseApiError(response)
    }

    return (await response.json()) as T
  }

  return { get }
}
