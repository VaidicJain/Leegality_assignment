import { createSelector } from '@reduxjs/toolkit'
import type { RootState } from '@/app/store'
import { serializeListingState } from './listingQuery'

export const selectListingState = (state: RootState) => state.listing

export const selectListingQuery = createSelector([selectListingState], serializeListingState)
