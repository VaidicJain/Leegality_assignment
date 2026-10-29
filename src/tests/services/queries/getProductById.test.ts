// @vitest-environment node
import { describe, expect, it } from 'vitest'
import { setupStore } from '@/app/store'
import { installFetchMock, phone, requestedUrl, respondWith } from '@/tests/helpers/apiTestUtils'
import { isNotFoundError } from '@/services/errors'
import { getProductByIdApi } from '@/services/queries/getProductById'
import type { Product } from '@/services/types'

installFetchMock()

describe('getProductById', () => {
  it('returns the full product', async () => {
    const product: Product = { ...phone, description: 'A phone', images: [], reviews: [] }
    respondWith(product)
    const store = setupStore()

    const result = await store.dispatch(getProductByIdApi.endpoints.getProductById.initiate(1))

    expect(result.data).toEqual(product)
    expect(requestedUrl().pathname).toBe('/products/1')
  })

  it('exposes a 404 for an unknown product', async () => {
    respondWith({ message: "Product with id '999' not found" }, 404)
    const store = setupStore()

    const result = await store.dispatch(getProductByIdApi.endpoints.getProductById.initiate(999))

    expect(result.isError).toBe(true)
    expect(isNotFoundError(result.error)).toBe(true)
  })
})
