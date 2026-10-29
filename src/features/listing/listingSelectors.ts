import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { serializeListingState } from './listingQuery'

export const selectListingState = (state: RootState) => state.listing
export const selectListing = (state: RootState) => state.listing
export const selectCategory = (state: RootState) => state.listing.category
export const selectSearch = (state: RootState) => state.listing.search
export const selectMinPrice = (state: RootState) => state.listing.minPrice
export const selectMaxPrice = (state: RootState) => state.listing.maxPrice
export const selectBrands = (state: RootState) => state.listing.brands
export const selectPage = (state: RootState) => state.listing.page

export const selectListingQuery = createSelector([selectListingState], serializeListingState)
