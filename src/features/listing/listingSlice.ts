import { createSlice } from '@reduxjs/toolkit'

/**
 * Shared, serializable listing preferences.
 * Server data (products, categories) is owned by RTK Query and never stored here.
 */
export interface ListingState {
  /** Selected category slug, or `null` for "All". */
  category: string | null
  /** Committed search text (trimmed). */
  search: string
  /** Inclusive lower price bound, or `null` for unbounded. */
  minPrice: number | null
  /** Inclusive upper price bound, or `null` for unbounded. */
  maxPrice: number | null
  /** Selected brand names. */
  brands: string[]
  /** Current 1-based page number. */
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

// Reducers and actions are added in the listing-state step.
const listingSlice = createSlice({
  name: 'listing',
  initialState: initialListingState,
  reducers: {},
})

export const listingReducer = listingSlice.reducer
