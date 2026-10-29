import { describe, expect, it } from 'vitest'
import {
  filtersChanged,
  filtersCleared,
  initialListingState,
  listingReducer,
  listingRestored,
  pageChanged,
  type ListingState,
} from '@/features/listing/listingSlice'

describe('listingSlice', () => {
  it('returns initial state with default values', () => {
    expect(listingReducer(undefined, { type: 'unknown' })).toEqual(initialListingState)
  })

  describe('filtersChanged', () => {
    it('updates category and resets page to 1', () => {
      const state: ListingState = { ...initialListingState, page: 3 }
      const next = listingReducer(state, filtersChanged({ category: 'smartphones' }))

      expect(next.category).toBe('smartphones')
      expect(next.page).toBe(1)
    })

    it('clears selected brands when category changes', () => {
      const state: ListingState = {
        ...initialListingState,
        category: 'laptops',
        brands: ['Apple', 'Dell'],
      }
      const next = listingReducer(state, filtersChanged({ category: 'smartphones' }))

      expect(next.category).toBe('smartphones')
      expect(next.brands).toEqual([])
      expect(next.page).toBe(1)
    })

    it('keeps selected brands when category remains the same', () => {
      const state: ListingState = {
        ...initialListingState,
        category: 'laptops',
        brands: ['Apple'],
      }
      const next = listingReducer(state, filtersChanged({ category: 'laptops', minPrice: 500 }))

      expect(next.category).toBe('laptops')
      expect(next.brands).toEqual(['Apple'])
      expect(next.minPrice).toBe(500)
      expect(next.page).toBe(1)
    })

    it('updates search query and resets page to 1', () => {
      const state: ListingState = { ...initialListingState, page: 5 }
      const next = listingReducer(state, filtersChanged({ search: 'phone' }))

      expect(next.search).toBe('phone')
      expect(next.page).toBe(1)
    })

    it('updates price range and resets page to 1', () => {
      const state: ListingState = { ...initialListingState, page: 2 }
      const next = listingReducer(state, filtersChanged({ minPrice: 100, maxPrice: 500 }))

      expect(next.minPrice).toBe(100)
      expect(next.maxPrice).toBe(500)
      expect(next.page).toBe(1)
    })

    it('updates brands and resets page to 1', () => {
      const state: ListingState = { ...initialListingState, page: 4 }
      const next = listingReducer(state, filtersChanged({ brands: ['Samsung', 'Apple'] }))

      expect(next.brands).toEqual(['Samsung', 'Apple'])
      expect(next.page).toBe(1)
    })
  })

  describe('pageChanged', () => {
    it('updates page when given a valid integer >= 1', () => {
      const state: ListingState = { ...initialListingState, page: 1 }
      const next = listingReducer(state, pageChanged(4))

      expect(next.page).toBe(4)
    })

    it('truncates floating point page numbers', () => {
      const state: ListingState = { ...initialListingState, page: 1 }
      const next = listingReducer(state, pageChanged(3.9))

      expect(next.page).toBe(3)
    })

    it('falls back to page 1 for zero or negative numbers', () => {
      const state: ListingState = { ...initialListingState, page: 3 }
      expect(listingReducer(state, pageChanged(0)).page).toBe(1)
      expect(listingReducer(state, pageChanged(-2)).page).toBe(1)
    })

    it('does not alter active filters', () => {
      const state: ListingState = {
        category: 'laptops',
        search: 'macbook',
        minPrice: 900,
        maxPrice: 2000,
        brands: ['Apple'],
        page: 1,
      }
      const next = listingReducer(state, pageChanged(2))

      expect(next).toEqual({ ...state, page: 2 })
    })
  })

  describe('filtersCleared', () => {
    it('resets all filters and page to initial defaults', () => {
      const modified: ListingState = {
        category: 'fragrances',
        search: 'rose',
        minPrice: 50,
        maxPrice: 200,
        brands: ['Chanel'],
        page: 4,
      }
      const next = listingReducer(modified, filtersCleared())

      expect(next).toEqual(initialListingState)
    })
  })

  describe('listingRestored', () => {
    it('restores the entire listing state', () => {
      const restoredState: ListingState = {
        category: 'groceries',
        search: 'milk',
        minPrice: 2,
        maxPrice: 10,
        brands: ['Nestle'],
        page: 3,
      }
      const next = listingReducer(initialListingState, listingRestored(restoredState))

      expect(next).toEqual(restoredState)
    })
  })
})
