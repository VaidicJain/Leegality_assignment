import { skipToken } from '@reduxjs/toolkit/query'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectCategory, selectPage } from '@/features/listing/listingSelectors'
import { filtersCleared, pageChanged } from '@/features/listing/listingSlice'
import { useListingUrlSync } from '@/features/listing/useListingUrlSync'
import { useGetProductsQuery, useGetProductsByCategoryQuery } from '@/services/queries'
import { getApiErrorMessage } from '@/services/errors'
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
  const category = useAppSelector(selectCategory)
  const currentPage = useAppSelector(selectPage)

  const skip = (currentPage - 1) * PAGE_SIZE
  const isCategorySelected = Boolean(category)

  // Fetch 20 products per page via limit and skip parameters
  const allProductsQuery = useGetProductsQuery(
    { limit: PAGE_SIZE, skip },
    { skip: isCategorySelected },
  )
  const categoryProductsQuery = useGetProductsByCategoryQuery(
    category ? { category, limit: PAGE_SIZE, skip } : skipToken,
  )

  const activeQuery = isCategorySelected ? categoryProductsQuery : allProductsQuery
  const { data, isLoading, isFetching, isError, error, refetch } = activeQuery

  const products = data?.products ?? []
  const total = data?.total ?? 0
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const hasProducts = products.length > 0
  const isInitialLoading = isLoading || (isFetching && !data)

  const categoryHeading = category
    ? category
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' ')
    : 'All Products'

  const handlePageChange = (page: number) => {
    if (page < 1 || page > totalPages || page === currentPage) return
    dispatch(pageChanged(page))
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  // Generate page numbers with ellipsis
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

  const startItem = total === 0 ? 0 : skip + 1
  const endItem = Math.min(skip + PAGE_SIZE, total)

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* Listing Header Bar */}
      <div className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {categoryHeading}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {total > 0 && `Showing ${startItem}–${endItem} of ${total} products`}
          </p>
        </div>
      </div>

      {/* Main Content Area */}
      {isInitialLoading ? (
        <ProductGridSkeleton count={8} />
      ) : isError ? (
        <ErrorState message={getApiErrorMessage(error)} onRetry={refetch} />
      ) : !hasProducts ? (
        <EmptyState
          title="No products available"
          message="There are currently no products found in this category."
          actionLabel="View All Products"
          onAction={() => dispatch(filtersCleared())}
        />
      ) : (
        <div className="space-y-10">
          <ProductGrid products={products} />

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
  )
}
