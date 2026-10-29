import { describe, expect, it } from 'vitest'
import { parseListingSearch, serializeListingState } from '@/features/listing/listingQuery'
import { initialListingState, type ListingState } from '@/features/listing/listingSlice'

describe('listingQuery serialization and parsing', () => {
  it('serializes default initial state to empty string', () => {
    expect(serializeListingState(initialListingState)).toBe('')
  })

  it('serializes category, search, minPrice, maxPrice, brands, and page', () => {
    const state: ListingState = {
      category: 'smartphones',
      search: 'iPhone',
      minPrice: 500,
      maxPrice: 1500,
      brands: ['Apple'],
      page: 2,
    }
    const query = serializeListingState(state)
    const params = new URLSearchParams(query)

    expect(params.get('category')).toBe('smartphones')
    expect(params.get('q')).toBe('iPhone')
    expect(params.get('minPrice')).toBe('500')
    expect(params.get('maxPrice')).toBe('1500')
    expect(params.getAll('brand')).toEqual(['Apple'])
    expect(params.get('page')).toBe('2')
  })

  it('omits page parameter when page is 1', () => {
    const state: ListingState = {
      ...initialListingState,
      category: 'laptops',
      page: 1,
    }
    const query = serializeListingState(state)
    const params = new URLSearchParams(query)

    expect(params.has('page')).toBe(false)
  })

  it('parses empty search string to initial defaults', () => {
    expect(parseListingSearch('')).toEqual(initialListingState)
  })

  it('parses multi-brand parameters into unique array', () => {
    const parsed = parseListingSearch('brand=Apple&brand=Dell&brand=Apple')
    expect(parsed.brands).toEqual(['Apple', 'Dell'])
  })

  it('parses valid numeric prices and trims search', () => {
    const parsed = parseListingSearch('q=%20laptop%20&minPrice=300&maxPrice=1200')
    expect(parsed.search).toBe('laptop')
    expect(parsed.minPrice).toBe(300)
    expect(parsed.maxPrice).toBe(1200)
  })

  it('safely handles invalid prices and invalid page numbers', () => {
    const parsed = parseListingSearch('minPrice=invalid&maxPrice=-10&page=0')
    expect(parsed.minPrice).toBeNull()
    expect(parsed.maxPrice).toBeNull()
    expect(parsed.page).toBe(1)
  })

  it('round-trips state through serialization and parsing', () => {
    const state: ListingState = {
      category: 'groceries',
      search: 'apple',
      minPrice: 5,
      maxPrice: 50,
      brands: ['Organic Farm', 'Fresh Valley'],
      page: 3,
    }

    const query = serializeListingState(state)
    const parsed = parseListingSearch(query)

    expect(parsed).toEqual(state)
  })
})
