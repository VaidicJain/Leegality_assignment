import { useMemo, useState } from 'react'
import { skipToken } from '@reduxjs/toolkit/query'
import { Filter, SlidersHorizontal, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCategory, selectListingState, selectPage } from '@/features/listing/listingSelectors'
import { filtersChanged, filtersCleared, pageChanged } from '@/features/listing/listingSlice'
import { useListingUrlSync } from '@/features/listing/useListingUrlSync'
import { useGetProductsQuery, useGetProductsByCategoryQuery } from '@/services/queries'
import { getApiErrorMessage } from '@/services/errors'
import { filterProducts, extractUniqueBrands } from '@/utils/filterProducts'
import { FilterSidebar } from '@/components/filters/FilterSidebar'
import { ProductGrid } from '@/components/product/ProductGrid'
import { ProductGridSkeleton } from '@/components/product/ProductCardSkeleton'
import { ErrorState } from '@/components/common/ErrorState'
import { EmptyState } from '@/components/common/EmptyState'
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from '@/components/ui/pagination'

const PAGE_SIZE = 20

export function ListingPage() {
  // Syncs URL parameters and Redux listing state bidirectionally
  useListingUrlSync()

  const dispatch = useAppDispatch()
  const listing = useAppSelector(selectListingState)
  const category = useAppSelector(selectCategory)
  const currentPage = useAppSelector(selectPage)

  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false)

  // Fetch complete product set for the category or full catalog (cached by RTK Query)
  const isCategorySelected = Boolean(category)
  const allProductsQuery = useGetProductsQuery({}, { skip: isCategorySelected })
  const categoryProductsQuery = useGetProductsByCategoryQuery(category ? { category } : skipToken)

  const activeQuery = isCategorySelected ? categoryProductsQuery : allProductsQuery
  const { data, isLoading, isFetching, isError, error, refetch } = activeQuery

  const rawProducts = useMemo(() => data?.products ?? [], [data?.products])
  const isInitialLoading = isLoading || (isFetching && !data)

  const availableBrands = useMemo(() => extractUniqueBrands(rawProducts), [rawProducts])

  const filteredProducts = useMemo(
    () => filterProducts(rawProducts, listing),
    [rawProducts, listing],
  )

  // Paginate 20 products per page
  const totalFiltered = filteredProducts.length
  const totalPages = Math.max(1, Math.ceil(totalFiltered / PAGE_SIZE))
  const skip = (currentPage - 1) * PAGE_SIZE
  const pagedProducts = useMemo(
    () => filteredProducts.slice(skip, skip + PAGE_SIZE),
    [filteredProducts, skip],
  )

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    dispatch(pageChanged(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate pagination items
  const getPageNumbers = () => {
    const pages: (number | 'ellipsis')[] = []
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i)
    } else {
      pages.push(1)
      if (currentPage > 3) pages.push('ellipsis')

      const start = Math.max(2, currentPage - 1)
      const end = Math.min(totalPages - 1, currentPage + 1)
      for (let i = start; i <= end; i++) pages.push(i)

      if (currentPage < totalPages - 2) pages.push('ellipsis')
      pages.push(totalPages)
    }
    return pages
  }

  const startItem = totalFiltered === 0 ? 0 : skip + 1
  const endItem = Math.min(skip + PAGE_SIZE, totalFiltered)

  // Active filter chip helpers
  const removeBrand = (brandToRemove: string) => {
    dispatch(filtersChanged({ brands: listing.brands.filter((b) => b !== brandToRemove) }))
  }

  const removePrice = () => {
    dispatch(filtersChanged({ minPrice: null, maxPrice: null }))
  }

  const removeCategory = () => {
    dispatch(filtersChanged({ category: null }))
  }

  const removeSearch = () => {
    dispatch(filtersChanged({ search: '' }))
  }

  const hasAnyFilter = Boolean(
    listing.category ||
    listing.search ||
    listing.minPrice !== null ||
    listing.maxPrice !== null ||
    listing.brands.length > 0,
  )

  const categoryHeading = category
    ? category
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'All Products'

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6 sm:px-6">
      {/* Mobile filter button */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-800 shadow-xs"
        >
          <SlidersHorizontal className="h-4 w-4" />
          <span>Filters</span>
          {hasAnyFilter && (
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-[11px] font-bold text-white">
              {(listing.category ? 1 : 0) +
                (listing.search ? 1 : 0) +
                (listing.minPrice !== null || listing.maxPrice !== null ? 1 : 0) +
                listing.brands.length}
            </span>
          )}
        </button>
      </div>

      {/* Main Two-Column Layout */}
      <div className="flex flex-col lg:flex-row lg:items-start lg:gap-8">
        {/* Desktop Sidebar */}
        <div className="hidden lg:block lg:w-64 xl:w-72 shrink-0">
          <FilterSidebar availableBrands={availableBrands} />
        </div>

        {/* Mobile Filter Drawer */}
        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-50 flex lg:hidden">
            <div
              className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs"
              onClick={() => setMobileFiltersOpen(false)}
            />
            <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white p-4 shadow-xl">
              <FilterSidebar
                availableBrands={availableBrands}
                onCloseMobile={() => setMobileFiltersOpen(false)}
              />
            </div>
          </div>
        )}

        {/* Right Content Area */}
        <div className="flex-1 min-w-0">
          <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-5 w-5 text-slate-500" />
              <h1 className="text-lg font-bold text-slate-900">{categoryHeading}</h1>
            </div>

            <div className="text-sm text-slate-500">
              {totalFiltered > 0 && `Showing ${startItem}–${endItem} of ${totalFiltered} products`}
            </div>
          </div>

          {/* Active Filter Chips */}
          {hasAnyFilter && (
            <div className="mb-5 flex flex-wrap items-center gap-2">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Active:
              </span>

              {listing.category && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  Category: {listing.category}
                  <button
                    type="button"
                    onClick={removeCategory}
                    className="hover:text-blue-900"
                    aria-label="Remove category filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {listing.search && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  "{listing.search}"
                  <button
                    type="button"
                    onClick={removeSearch}
                    className="hover:text-blue-900"
                    aria-label="Remove search filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {(listing.minPrice !== null || listing.maxPrice !== null) && (
                <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700">
                  Price: ${listing.minPrice ?? 0} – ${listing.maxPrice ?? '∞'}
                  <button
                    type="button"
                    onClick={removePrice}
                    className="hover:text-blue-900"
                    aria-label="Remove price filter"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              )}

              {listing.brands.map((b) => (
                <span
                  key={b}
                  className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2.5 py-1 text-xs font-medium text-blue-700"
                >
                  {b}
                  <button
                    type="button"
                    onClick={() => removeBrand(b)}
                    className="hover:text-blue-900"
                    aria-label={`Remove brand ${b}`}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}

              <button
                type="button"
                onClick={() => dispatch(filtersCleared())}
                className="text-xs font-semibold text-red-600 hover:underline ml-1"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Product Grid / Loading / Error / Empty States */}
          {isInitialLoading ? (
            <ProductGridSkeleton count={8} />
          ) : isError ? (
            <ErrorState message={getApiErrorMessage(error)} onRetry={refetch} />
          ) : totalFiltered === 0 ? (
            <EmptyState
              title="No matching products found"
              message="No products match the selected filters. Try broadening your search or clearing some filters."
              actionLabel="Clear Filters"
              onAction={() => dispatch(filtersCleared())}
            />
          ) : (
            <div className="space-y-8">
              <ProductGrid products={pagedProducts} />

              {/* shadcn Pagination */}
              {totalPages > 1 && (
                <div className="border-t border-slate-200 pt-6">
                  <Pagination>
                    <PaginationContent>
                      <PaginationItem>
                        <PaginationPrevious
                          onClick={() => handlePageChange(currentPage - 1)}
                          disabled={currentPage <= 1}
                        />
                      </PaginationItem>

                      {getPageNumbers().map((item, idx) => (
                        <PaginationItem key={idx}>
                          {item === 'ellipsis' ? (
                            <PaginationEllipsis />
                          ) : (
                            <PaginationLink
                              isActive={item === currentPage}
                              onClick={() => handlePageChange(item)}
                            >
                              {item}
                            </PaginationLink>
                          )}
                        </PaginationItem>
                      ))}

                      <PaginationItem>
                        <PaginationNext
                          onClick={() => handlePageChange(currentPage + 1)}
                          disabled={currentPage >= totalPages}
                        />
                      </PaginationItem>
                    </PaginationContent>
                  </Pagination>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
