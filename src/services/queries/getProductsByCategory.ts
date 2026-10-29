import { api } from '../api'
import type { ProductListResponse } from '../types'
import { toListParams, type ProductsPaging } from './listParams'

export interface ProductsByCategoryArgs extends ProductsPaging {
  category: string
}

export const getProductsByCategoryApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductsByCategory: builder.query<ProductListResponse, ProductsByCategoryArgs>({
      query: ({ category, ...paging }) => ({
        url: `/products/category/${encodeURIComponent(category)}`,
        params: toListParams(paging),
      }),
    }),
  }),
})

export const { useGetProductsByCategoryQuery } = getProductsByCategoryApi
