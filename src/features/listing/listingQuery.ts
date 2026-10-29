import type { ListingState } from './listingSlice'

const PARAM = {
  category: 'category',
  search: 'q',
  minPrice: 'minPrice',
  maxPrice: 'maxPrice',
  brand: 'brand',
  page: 'page',
} as const

const parsePrice = (value: string | null): number | null => {
  if (value === null || value.trim() === '') return null
  const price = Number(value)
  return Number.isFinite(price) && price >= 0 ? price : null
}

const parsePage = (value: string | null): number => {
  const page = Number(value)
  return Number.isInteger(page) && page >= 1 ? page : 1
}

export function serializeListingState(state: ListingState): string {
  const params = new URLSearchParams()
  if (state.category) params.set(PARAM.category, state.category)
  if (state.search) params.set(PARAM.search, state.search)
  if (state.minPrice !== null) params.set(PARAM.minPrice, String(state.minPrice))
  if (state.maxPrice !== null) params.set(PARAM.maxPrice, String(state.maxPrice))
  for (const brand of state.brands) params.append(PARAM.brand, brand)
  if (state.page > 1) params.set(PARAM.page, String(state.page))
  return params.toString()
}

export function parseListingSearch(search: string): ListingState {
  const params = new URLSearchParams(search)
  return {
    category: params.get(PARAM.category) || null,
    search: (params.get(PARAM.search) ?? '').trim(),
    minPrice: parsePrice(params.get(PARAM.minPrice)),
    maxPrice: parsePrice(params.get(PARAM.maxPrice)),
    brands: [...new Set(params.getAll(PARAM.brand).filter(Boolean))],
    page: parsePage(params.get(PARAM.page)),
  }
}
