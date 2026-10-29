import { api } from '../api'
import type { Product } from '../types'

export const getProductByIdApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProductById: builder.query<Product, number>({
      query: (id) => `/products/${id}`,
    }),
  }),
})

export const { useGetProductByIdQuery } = getProductByIdApi
