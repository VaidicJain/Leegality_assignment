import { describe, expect, it } from 'vitest'
import { getApiErrorMessage, isNotFoundError } from '@/services/errors'

describe('isNotFoundError', () => {
  it('is true only for a 404 response', () => {
    expect(isNotFoundError({ status: 404, data: { message: 'not found' } })).toBe(true)
    expect(isNotFoundError({ status: 500, data: null })).toBe(false)
    expect(isNotFoundError({ status: 'FETCH_ERROR', error: 'boom' })).toBe(false)
  })

  it('is false for values that are not API errors', () => {
    expect(isNotFoundError(undefined)).toBe(false)
    expect(isNotFoundError(new Error('boom'))).toBe(false)
    expect(isNotFoundError({ message: 'serialized error' })).toBe(false)
  })
})

describe('getApiErrorMessage', () => {
  it.each([
    [{ status: 'FETCH_ERROR', error: 'boom' }, /network error/i],
    [{ status: 'TIMEOUT_ERROR', error: 'slow' }, /timed out/i],
    [{ status: 'PARSING_ERROR', originalStatus: 200, data: '', error: 'bad json' }, /unexpected/i],
    [{ status: 404, data: { message: 'missing' } }, /could not find/i],
    [{ status: 503, data: null }, /server ran into a problem/i],
    [{ status: 400, data: null }, /something went wrong/i],
    [new Error('boom'), /something went wrong/i],
    [undefined, /something went wrong/i],
  ])('maps %j to a friendly message', (error, expected) => {
    expect(getApiErrorMessage(error)).toMatch(expected)
  })
})
