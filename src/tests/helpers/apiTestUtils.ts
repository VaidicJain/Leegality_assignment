import { afterEach, beforeEach, vi } from 'vitest'
import type { ProductListResponse, ProductSummary } from '@/services/types'

/** Shared fixtures and `fetch` mocking for the query tests. */

export const phone: ProductSummary = {
  id: 1,
  title: 'Phone',
  price: 100,
  rating: 4.5,
  brand: 'Acme',
  category: 'smartphones',
  thumbnail: 'https://example.com/phone.png',
}

export const listResponse: ProductListResponse = { products: [phone], total: 1, skip: 0, limit: 0 }

export const fetchMock = vi.fn<(request: Request) => Promise<Response>>()

/** Call once at the top of a test file: every test then gets a fresh mocked global `fetch`. */
export function installFetchMock() {
  beforeEach(() => {
    fetchMock.mockReset()
    vi.stubGlobal('fetch', fetchMock)
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })
}

/** Makes every mocked request answer with the given JSON body and status. */
export const respondWith = (body: unknown, status = 200) =>
  fetchMock.mockImplementation(async () => Response.json(body, { status }))

/** The URL requested by the n-th `fetch` call. */
export const requestedUrl = (callIndex = 0): URL => {
  const request = fetchMock.mock.calls[callIndex]?.[0]
  if (!request) {
    throw new Error(`Expected fetch call #${callIndex} to have happened`)
  }
  return new URL(request.url)
}
