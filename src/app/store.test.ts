import { describe, expect, it } from 'vitest'
import { initialListingState } from '@/features/listing/listingSlice'
import { setupStore } from './store'

describe('store', () => {
  it('initialises the listing slice with its defaults', () => {
    expect(setupStore().getState().listing).toEqual(initialListingState)
  })

  it('accepts preloaded listing state', () => {
    const store = setupStore({ listing: { ...initialListingState, category: 'laptops', page: 3 } })

    expect(store.getState().listing.category).toBe('laptops')
    expect(store.getState().listing.page).toBe(3)
  })
})
