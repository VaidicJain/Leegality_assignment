import { describe, expect, it } from 'vitest'
import { API_BASE_URL, api } from '@/services/api'
// Importing the barrel registers every query on the shared API slice.
import '@/services/queries'

describe('api slice', () => {
  it('points at the DummyJSON base URL', () => {
    expect(API_BASE_URL).toBe('https://dummyjson.com')
  })

  it('is mounted under the "api" key of the store', () => {
    expect(api.reducerPath).toBe('api')
  })

  it('has all four required endpoints registered by the query modules', () => {
    // `api` itself is typed without endpoints (they are injected), so inspect it at runtime.
    expect(Object.keys(api.endpoints).sort()).toEqual([
      'getCategories',
      'getProductById',
      'getProducts',
      'getProductsByCategory',
    ])
  })
})
