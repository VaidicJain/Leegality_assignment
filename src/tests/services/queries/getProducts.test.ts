// @vitest-environment node
// Node's fetch/Request are used directly: jsdom's AbortSignal is rejected by Node's Request.
import { describe, expect, it } from 'vitest'
import { setupStore } from '@/app/store'
import {
  fetchMock,
  installFetchMock,
  listResponse,
  requestedUrl,
  respondWith,
} from '@/tests/helpers/apiTestUtils'
import { API_BASE_URL } from '@/services/api'
import { getApiErrorMessage } from '@/services/errors'
import { getProductsApi } from '@/services/queries/getProducts'

installFetchMock()

describe('getProducts', () => {
  it('requests the whole catalog with only the listing fields', async () => {
    respondWith(listResponse)
    const store = setupStore()

    const result = await store.dispatch(getProductsApi.endpoints.getProducts.initiate({}))

    expect(result.data).toEqual(listResponse)
    const url = requestedUrl()
    expect(url.origin).toBe(API_BASE_URL)
    expect(url.pathname).toBe('/products')
    expect(url.searchParams.get('limit')).toBe('0')
    expect(url.searchParams.get('skip')).toBe('0')
    expect(url.searchParams.get('select')).toBe('id,title,price,rating,brand,category,thumbnail')
  })

  it('forwards limit and skip', async () => {
    respondWith(listResponse)
    const store = setupStore()

    await store.dispatch(getProductsApi.endpoints.getProducts.initiate({ limit: 12, skip: 24 }))

    expect(requestedUrl().searchParams.get('limit')).toBe('12')
    expect(requestedUrl().searchParams.get('skip')).toBe('24')
  })

  it('serves repeated identical requests from the cache', async () => {
    respondWith(listResponse)
    const store = setupStore()

    await store.dispatch(getProductsApi.endpoints.getProducts.initiate({}))
    await store.dispatch(getProductsApi.endpoints.getProducts.initiate({}))

    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('surfaces a network failure with a friendly message', async () => {
    fetchMock.mockRejectedValue(new TypeError('Failed to fetch'))
    const store = setupStore()

    const result = await store.dispatch(getProductsApi.endpoints.getProducts.initiate({}))

    expect(result.isError).toBe(true)
    expect(getApiErrorMessage(result.error)).toMatch(/network error/i)
  })
})
