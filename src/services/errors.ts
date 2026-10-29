import type { FetchBaseQueryError } from '@reduxjs/toolkit/query'

const isFetchBaseQueryError = (error: unknown): error is FetchBaseQueryError =>
  typeof error === 'object' && error !== null && 'status' in error

/** True when the API answered 404 */
export const isNotFoundError = (error: unknown): boolean =>
  isFetchBaseQueryError(error) && error.status === 404

/** Turns any RTK Query error into a short, user-facing message. */
export function getApiErrorMessage(error: unknown): string {
  if (isFetchBaseQueryError(error)) {
    switch (error.status) {
      case 'FETCH_ERROR':
        return 'Network error. Check your connection and try again.'
      case 'TIMEOUT_ERROR':
        return 'The request timed out. Please try again.'
      case 'PARSING_ERROR':
        return 'Received an unexpected response from the server.'
      case 404:
        return 'We could not find what you were looking for.'
      default:
        if (typeof error.status === 'number' && error.status >= 500) {
          return 'The server ran into a problem. Please try again shortly.'
        }
    }
  }
  return 'Something went wrong. Please try again.'
}
