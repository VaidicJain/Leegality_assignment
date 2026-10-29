import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { filtersChanged } from '@/features/listing/listingSlice'
import { selectSearch } from '@/features/listing/listingSelectors'
import { useListingPath } from '@/features/listing/useListingPath'

export function Header() {
  const dispatch = useAppDispatch()
  const reduxSearch = useAppSelector(selectSearch)
  const listingPath = useListingPath()
  const navigate = useNavigate()
  const location = useLocation()

  const [prevReduxSearch, setPrevReduxSearch] = useState(reduxSearch)
  const [localQuery, setLocalQuery] = useState(reduxSearch)

  if (prevReduxSearch !== reduxSearch) {
    setPrevReduxSearch(reduxSearch)
    setLocalQuery(reduxSearch)
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    const trimmed = localQuery.trim()
    dispatch(filtersChanged({ search: trimmed }))

    if (location.pathname !== '/') {
      navigate('/')
    }
  }

  const handleClear = () => {
    setLocalQuery('')
    dispatch(filtersChanged({ search: '' }))
  }

  return (
    <header className="sticky top-0 z-50 bg-slate-800 text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          to={listingPath}
          className="flex items-center gap-2 text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-90"
          aria-label="Leegality Store Home"
        >
          <span>Leegality</span>
          <span className="rounded bg-amber-500/20 px-1.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-amber-400">
            Store
          </span>
        </Link>

        <form
          className="flex w-full max-w-xl flex-1 items-center"
          onSubmit={handleSubmit}
          role="search"
        >
          <div className="relative flex w-full items-center">
            <input
              type="search"
              className="h-10 w-full rounded-l-md border border-transparent bg-white px-3 pr-8 text-sm text-slate-900 outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Search products, brands, or categories..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              aria-label="Search products"
            />
            {localQuery && (
              <button
                type="button"
                className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700"
                onClick={handleClear}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
          <button
            type="submit"
            className="flex h-10 items-center justify-center rounded-r-md bg-amber-500 px-4 text-slate-900 hover:bg-amber-600 transition-colors"
            aria-label="Submit search"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </button>
        </form>

        <nav className="flex items-center gap-4" aria-label="Main Navigation">
          <Link
            to={listingPath}
            className="rounded-md px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-white/10"
          >
            Products
          </Link>
        </nav>
      </div>
    </header>
  )
}
