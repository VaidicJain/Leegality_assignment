// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { setupStore } from '@/app/store'
import { installFetchMock, requestedUrl, respondWith } from '@/tests/helpers/apiTestUtils'
import { API_BASE_URL } from '@/services/api'
import { getCategoriesApi } from '@/services/queries/getCategories'
import type { Category } from '@/services/types'

installFetchMock()

describe('getCategories', () => {
  it('returns the category objects', async () => {
    const categories: Category[] = [
      { slug: 'laptops', name: 'Laptops', url: `${API_BASE_URL}/products/category/laptops` },
    ]
    respondWith(categories)
    const store = setupStore()

    const result = await store.dispatch(getCategoriesApi.endpoints.getCategories.initiate())

    expect(result.data).toEqual(categories)
    expect(requestedUrl().pathname).toBe('/products/categories')
  })
})
