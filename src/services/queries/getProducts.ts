import { api } from '../api'
import type { ProductListResponse } from '../types'
import { toListParams, type ProductsPaging } from './listParams'

export const getProductsApi = api.injectEndpoints({
  endpoints: (builder) => ({
    /** Pass `{}` for the whole catalog. Each distinct argument object is cached separately. */
    getProducts: builder.query<ProductListResponse, ProductsPaging>({
      query: (paging) => ({ url: '/products', params: toListParams(paging) }),
    }),
  }),
})

export const { useGetProductsQuery } = getProductsApi
