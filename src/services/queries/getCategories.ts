import { api } from '../api'
import type { Category } from '../types'

export const getCategoriesApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getCategories: builder.query<Category[], void>({
      query: () => '/products/categories',
    }),
  }),
})

export const { useGetCategoriesQuery } = getCategoriesApi
