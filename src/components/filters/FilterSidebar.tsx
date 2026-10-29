import { useState, useId, type FormEvent } from 'react'
import { Search, RotateCcw, X } from 'lucide-react'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { selectListingState } from '@/features/listing/listingSelectors'
import { filtersChanged, filtersCleared } from '@/features/listing/listingSlice'
import { useGetCategoriesQuery } from '@/services/queries'
import type { Category } from '@/services/types'

interface FilterSidebarProps {
  availableBrands: string[]
  onCloseMobile?: () => void
}

export function FilterSidebar({ availableBrands, onCloseMobile }: FilterSidebarProps) {
  const dispatch = useAppDispatch()
  const listing = useAppSelector(selectListingState)
  const searchInputId = useId()

  const { data: categoriesData, isLoading: isCategoriesLoading } = useGetCategoriesQuery()

  // Local state for sidebar search with render-phase state adjustment
  const [prevSearch, setPrevSearch] = useState(listing.search)
  const [localSearch, setLocalSearch] = useState(listing.search)
  if (prevSearch !== listing.search) {
    setPrevSearch(listing.search)
    setLocalSearch(listing.search)
  }

  const [prevMin, setPrevMin] = useState(listing.minPrice)
  const [prevMax, setPrevMax] = useState(listing.maxPrice)
  const [minInput, setMinInput] = useState(
    listing.minPrice !== null ? String(listing.minPrice) : '',
  )
  const [maxInput, setMaxInput] = useState(
    listing.maxPrice !== null ? String(listing.maxPrice) : '',
  )
  const [priceError, setPriceError] = useState<string | null>(null)

  if (prevMin !== listing.minPrice || prevMax !== listing.maxPrice) {
    setPrevMin(listing.minPrice)
    setPrevMax(listing.maxPrice)
    setMinInput(listing.minPrice !== null ? String(listing.minPrice) : '')
    setMaxInput(listing.maxPrice !== null ? String(listing.maxPrice) : '')
  }

  const categories: { slug: string; name: string }[] = (categoriesData ?? []).map(
    (cat: Category | string) => {
      if (typeof cat === 'string') {
        return {
          slug: cat,
          name: cat
            .split('-')
            .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' '),
        }
      }
      return {
        slug: cat.slug,
        name: cat.name || cat.slug,
      }
    },
  )

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault()
    dispatch(filtersChanged({ search: localSearch.trim() }))
  }

  const handleCategoryToggle = (slug: string) => {
    const isCurrentlySelected = listing.category === slug
    dispatch(filtersChanged({ category: isCurrentlySelected ? null : slug }))
  }

  const handlePriceApply = (e: FormEvent) => {
    e.preventDefault()
    setPriceError(null)

    const parsedMin = minInput.trim() === '' ? null : Number(minInput)
    const parsedMax = maxInput.trim() === '' ? null : Number(maxInput)

    if (parsedMin !== null && (isNaN(parsedMin) || parsedMin < 0)) {
      setPriceError('Min price must be a positive number')
      return
    }

    if (parsedMax !== null && (isNaN(parsedMax) || parsedMax < 0)) {
      setPriceError('Max price must be a positive number')
      return
    }

    if (parsedMin !== null && parsedMax !== null && parsedMin > parsedMax) {
      setPriceError('Min price cannot be greater than Max price')
      return
    }

    dispatch(filtersChanged({ minPrice: parsedMin, maxPrice: parsedMax }))
  }

  const handleBrandToggle = (brand: string) => {
    const isSelected = listing.brands.includes(brand)
    const nextBrands = isSelected
      ? listing.brands.filter((b) => b !== brand)
      : [...listing.brands, brand]

    dispatch(filtersChanged({ brands: nextBrands }))
  }

  const hasActiveFilters = Boolean(
    listing.category ||
    listing.search ||
    listing.minPrice !== null ||
    listing.maxPrice !== null ||
    listing.brands.length > 0,
  )

  const handleClearAll = () => {
    dispatch(filtersCleared())
    setLocalSearch('')
    setMinInput('')
    setMaxInput('')
    setPriceError(null)
  }

  return (
    <aside className="w-full rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
      {/* Mobile Header with close button */}
      <div className="mb-4 flex items-center justify-between lg:hidden">
        <h2 className="text-lg font-bold text-slate-900">Filters</h2>
        {onCloseMobile && (
          <button
            type="button"
            onClick={onCloseMobile}
            className="rounded-md p-1.5 text-slate-500 hover:bg-slate-100"
            aria-label="Close filters"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Sidebar Search matching screenshot */}
      <form onSubmit={handleSearchSubmit} className="relative mb-6">
        <label htmlFor={searchInputId} className="sr-only">
          Search products in sidebar
        </label>
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          id={searchInputId}
          type="text"
          placeholder="Search..."
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          className="w-full rounded-md border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition-all focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
        />
      </form>

      {/* Clear Filters Quick Action */}
      {hasActiveFilters && (
        <button
          type="button"
          onClick={handleClearAll}
          className="mb-6 flex w-full items-center justify-center gap-1.5 rounded-md border border-slate-200 py-1.5 text-xs font-semibold text-slate-600 transition-colors hover:bg-slate-50 hover:text-red-600"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear All Filters</span>
        </button>
      )}

      {/* Categories Section */}
      <div className="mb-6 border-b border-slate-100 pb-6">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Categories</h3>
        {isCategoriesLoading ? (
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-4 animate-pulse rounded bg-slate-100" />
            ))}
          </div>
        ) : (
          <div className="max-h-56 space-y-2.5 overflow-y-auto pr-1">
            {categories.map((cat) => {
              const isChecked = listing.category === cat.slug
              return (
                <label
                  key={cat.slug}
                  className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 select-none hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleCategoryToggle(cat.slug)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={isChecked ? 'font-semibold text-blue-600' : ''}>{cat.name}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>

      {/* Price Range Section */}
      <div className="mb-6 border-b border-slate-100 pb-6">
        <h3 className="mb-3 text-sm font-bold text-slate-900">Price Range</h3>
        <form onSubmit={handlePriceApply} className="space-y-3">
          <div className="flex items-center gap-2">
            <input
              type="number"
              placeholder="Min"
              min="0"
              value={minInput}
              onChange={(e) => setMinInput(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
            <span className="text-slate-400 text-sm">–</span>
            <input
              type="number"
              placeholder="Max"
              min="0"
              value={maxInput}
              onChange={(e) => setMaxInput(e.target.value)}
              className="w-full rounded-md border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:border-blue-500 focus:bg-white focus:ring-1 focus:ring-blue-500"
            />
          </div>

          {priceError && <p className="text-xs text-red-600">{priceError}</p>}

          <button
            type="submit"
            className="w-full rounded-md bg-blue-600 py-2 text-sm font-semibold text-white shadow-xs transition-colors hover:bg-blue-700 active:bg-blue-800"
          >
            Apply
          </button>
        </form>
      </div>

      {/* Brands Section */}
      <div>
        <h3 className="mb-3 text-sm font-bold text-slate-900">Brands</h3>
        {availableBrands.length === 0 ? (
          <p className="text-xs text-slate-400">No brands available</p>
        ) : (
          <div className="max-h-56 space-y-2.5 overflow-y-auto pr-1">
            {availableBrands.map((brand) => {
              const isChecked = listing.brands.includes(brand)
              return (
                <label
                  key={brand}
                  className="flex cursor-pointer items-center gap-2.5 text-sm text-slate-700 select-none hover:text-slate-900"
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => handleBrandToggle(brand)}
                    className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className={isChecked ? 'font-semibold text-blue-600' : ''}>{brand}</span>
                </label>
              )
            })}
          </div>
        )}
      </div>
    </aside>
  )
}
