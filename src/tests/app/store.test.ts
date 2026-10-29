import { describe, expect, it } from 'vitest'
import { initialListingState } from '@/features/listing/listingSlice'
import { api } from '@/services/api'
import { setupStore } from '@/app/store'

describe('store', () => {
  it('initialises the listing slice with its defaults', () => {
    expect(setupStore().getState().listing).toEqual(initialListingState)
  })

  it('accepts preloaded listing state', () => {
    const store = setupStore({ listing: { ...initialListingState, category: 'laptops', page: 3 } })

    expect(store.getState().listing.category).toBe('laptops')
    expect(store.getState().listing.page).toBe(3)
  })

  it('registers the RTK Query API reducer', () => {
    expect(setupStore().getState()).toHaveProperty(api.reducerPath)
  })
})
