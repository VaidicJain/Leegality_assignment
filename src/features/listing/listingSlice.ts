import { createSlice, type PayloadAction } from '@reduxjs/toolkit'

export interface ListingFilters {
  category: string | null
  search: string
  minPrice: number | null
  maxPrice: number | null
  brands: string[]
}

export interface ListingState extends ListingFilters {
  page: number
}

export const initialListingState: ListingState = {
  category: null,
  search: '',
  minPrice: null,
  maxPrice: null,
  brands: [],
  page: 1,
}

const listingSlice = createSlice({
  name: 'listing',
  initialState: initialListingState,
  reducers: {
    /**
     * The only way filters change, so the page reset (and the brand reset on a category change)
     * lives in exactly one place.
     */
    filtersChanged(state, action: PayloadAction<Partial<ListingFilters>>) {
      const changes = action.payload

      // Brand options depend on the category, so a different category invalidates the selection.
      if (changes.category !== undefined && changes.category !== state.category) {
        state.brands = []
      }

      Object.assign(state, changes)
      state.page = 1
    },

    pageChanged(state, action: PayloadAction<number>) {
      const page = Math.trunc(action.payload)
      state.page = Number.isFinite(page) && page > 0 ? page : 1
    },

    filtersCleared: () => initialListingState,

    listingRestored(_state, action: PayloadAction<ListingState>) {
      return action.payload
    },
  },
})

export const { filtersChanged, pageChanged, filtersCleared, listingRestored } = listingSlice.actions
export const listingReducer = listingSlice.reducer
