import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface ListingState {
  category: string | null
  search: string
  minPrice: number | null
  maxPrice: number | null
  brands: string[]
  page: number
}

export type ListingFilters = Omit<ListingState, 'page'>

export const initialListingState: ListingState = {
  category: null,
  search: '',
  minPrice: null,
  maxPrice: null,
  brands: [],
  page: 1,
}

const applyFilters = (state: ListingState, patch: Partial<ListingFilters>) => {
  Object.assign(state, patch)
  state.page = 1
}

const listingSlice = createSlice({
  name: 'listing',
  initialState: initialListingState,
  reducers: {
    categorySelected: (state, action: PayloadAction<string | null>) => {
      applyFilters(state, { category: action.payload })
    },
    searchChanged: (state, action: PayloadAction<string>) => {
      applyFilters(state, { search: action.payload })
    },
    priceRangeApplied: (
      state,
      action: PayloadAction<{ min: number | null; max: number | null }>,
    ) => {
      applyFilters(state, { minPrice: action.payload.min, maxPrice: action.payload.max })
    },
    brandToggled: (state, action: PayloadAction<string>) => {
      const brand = action.payload
      const brands = state.brands.includes(brand)
        ? state.brands.filter((selected) => selected !== brand)
        : [...state.brands, brand]
      applyFilters(state, { brands })
    },
    filtersCleared: (state) => {
      applyFilters(state, {
        category: null,
        search: '',
        minPrice: null,
        maxPrice: null,
        brands: [],
      })
    },
    /** Pagination is the one change that must NOT reset the page. */
    pageChanged: (state, action: PayloadAction<number>) => {
      state.page = Number.isInteger(action.payload) && action.payload >= 1 ? action.payload : 1
    },
    /** Replaces the whole listing state, used when the URL is the source */
    listingRestored: (_state, action: PayloadAction<ListingState>) => action.payload,
  },
})

export const {
  categorySelected,
  searchChanged,
  priceRangeApplied,
  brandToggled,
  filtersCleared,
  pageChanged,
  listingRestored,
} = listingSlice.actions

export const listingReducer = listingSlice.reducer
