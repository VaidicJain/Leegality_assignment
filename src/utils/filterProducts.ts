import type { ProductSummary } from '@/services/types'
import type { ListingFilters } from '@/features/listing/listingSlice'

/**
 * Pure function that applies combined search, price, and brand filters to a product list.
 */
export function filterProducts(
  products: ProductSummary[],
  filters: ListingFilters,
): ProductSummary[] {
  const normalizedSearch = filters.search.trim().toLowerCase()
  const searchWords = normalizedSearch.split(/\s+/).filter(Boolean)

  return products.filter((product) => {
    // 1. Search filter: matches all typed words in title, brand, or category
    if (searchWords.length > 0) {
      const title = product.title.toLowerCase()
      const brand = (product.brand ?? '').toLowerCase()
      const category = product.category.toLowerCase()
      const searchableText = `${title} ${brand} ${category}`

      const matchesAllWords = searchWords.every((word) => searchableText.includes(word))
      if (!matchesAllWords) return false
    }

    // 2. Min Price filter (inclusive)
    if (filters.minPrice !== null && product.price < filters.minPrice) {
      return false
    }

    // 3. Max Price filter (inclusive)
    if (filters.maxPrice !== null && product.price > filters.maxPrice) {
      return false
    }

    // 4. Brand filter (multi-select): if brands selected, product must have that brand
    if (filters.brands.length > 0) {
      if (!product.brand || !filters.brands.includes(product.brand)) {
        return false
      }
    }

    return true
  })
}

/**
 * Extracts unique, non-empty brand names from a list of products.
 */
export function extractUniqueBrands(products: ProductSummary[]): string[] {
  const brandSet = new Set<string>()
  for (const product of products) {
    if (product.brand && product.brand.trim() !== '') {
      brandSet.add(product.brand.trim())
    }
  }
  return Array.from(brandSet).sort((a, b) => a.localeCompare(b))
}
