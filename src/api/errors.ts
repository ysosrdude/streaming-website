import type { ApiErrorBody } from '../types/api'

export class ApiError extends Error {
  readonly status: number
  readonly code?: string
  readonly requestId?: string
  readonly retryAfter?: number

  constructor(
    message: string,
    status: number,
    details?: { code?: string; requestId?: string; retryAfter?: number },
  ) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.code = details?.code
    this.requestId = details?.requestId
    this.retryAfter = details?.retryAfter
  }
}

export async function parseApiError(response: Response): Promise<ApiError> {
  const retryAfterHeader = response.headers.get('Retry-After')
  const retryAfter = retryAfterHeader
    ? Number.parseInt(retryAfterHeader, 10)
    : undefined

  let code: string | undefined
  let requestId: string | undefined

  try {
    const body = (await response.json()) as ApiErrorBody
    code = body.error?.code
    requestId = body.error?.requestId
  } catch {
    // Non-JSON error body
  }

  const message =
    code ??
    response.statusText ??
    `Request failed with status ${response.status}`

  return new ApiError(message, response.status, {
    code,
    requestId,
    retryAfter: Number.isFinite(retryAfter) ? retryAfter : undefined,
  })
}
