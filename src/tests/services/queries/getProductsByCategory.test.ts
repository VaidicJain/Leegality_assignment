// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { setupStore } from '@/app/store'
import {
  fetchMock,
  installFetchMock,
  listResponse,
  requestedUrl,
  respondWith,
} from '@/tests/helpers/apiTestUtils'
import { getProductsByCategoryApi } from '@/services/queries/getProductsByCategory'

installFetchMock()

const { getProductsByCategory } = getProductsByCategoryApi.endpoints

describe('getProductsByCategory', () => {
  it('requests the category endpoint with the same listing fields', async () => {
    respondWith(listResponse)
    const store = setupStore()

    await store.dispatch(getProductsByCategory.initiate({ category: 'smartphones' }))

    const url = requestedUrl()
    expect(url.pathname).toBe('/products/category/smartphones')
    expect(url.searchParams.get('limit')).toBe('0')
    expect(url.searchParams.get('select')).toContain('brand')
  })

  it('caches each category separately', async () => {
    respondWith(listResponse)
    const store = setupStore()

    await store.dispatch(getProductsByCategory.initiate({ category: 'laptops' }))
    await store.dispatch(getProductsByCategory.initiate({ category: 'tablets' }))
    await store.dispatch(getProductsByCategory.initiate({ category: 'laptops' }))

    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(requestedUrl(0).pathname).toBe('/products/category/laptops')
    expect(requestedUrl(1).pathname).toBe('/products/category/tablets')
  })

  it('encodes unusual category slugs', async () => {
    respondWith(listResponse)
    const store = setupStore()

    await store.dispatch(getProductsByCategory.initiate({ category: 'a b/c' }))

    expect(requestedUrl().pathname).toBe('/products/category/a%20b%2Fc')
  })
})
