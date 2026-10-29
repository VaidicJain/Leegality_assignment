import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, Search, ShoppingCart, User } from 'lucide-react'
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
    <header className="sticky top-0 z-50 bg-[#232f3e] text-white shadow-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6">
        {/* Left: Hamburger & Brand */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="rounded p-1 text-slate-300 hover:text-white lg:hidden"
            aria-label="Toggle navigation menu"
          >
            <Menu className="h-6 w-6" />
          </button>

          <Link
            to={listingPath}
            className="flex items-center gap-1.5 text-xl font-bold tracking-tight text-white transition-opacity hover:opacity-95"
            aria-label="Leegality Store Home"
          >
            <span>Leegality</span>
            <span className="rounded bg-amber-400 px-1 py-0.2 text-[10px] font-bold uppercase tracking-wider text-slate-900">
              Store
            </span>
          </Link>
        </div>

        {/* Center: Search bar matching screenshot */}
        <form
          className="flex w-full max-w-xl flex-1 items-center"
          onSubmit={handleSubmit}
          role="search"
        >
          <div className="relative flex w-full items-center">
            <button
              type="submit"
              className="absolute left-2.5 top-1/2 -translate-y-1/2 rounded p-1 text-slate-400 hover:text-slate-700"
              aria-label="Submit search"
            >
              <Search className="h-4 w-4" />
            </button>
            <input
              type="search"
              className="h-10 w-full rounded-md border-0 bg-white pl-10 pr-8 text-sm text-slate-900 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-amber-500"
              placeholder="Search products..."
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              aria-label="Search products"
            />
            {localQuery && (
              <button
                type="button"
                className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full p-1 text-slate-400 hover:text-slate-700"
                onClick={handleClear}
                aria-label="Clear search"
              >
                ×
              </button>
            )}
          </div>
        </form>

        {/* Right: Cart and Profile icons matching screenshot */}
        <div className="flex items-center gap-4 text-slate-200">
          <button
            type="button"
            className="relative rounded-md p-1.5 hover:text-white transition-colors"
            aria-label="Shopping Cart"
          >
            <ShoppingCart className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="rounded-md p-1.5 hover:text-white transition-colors"
            aria-label="User Account"
          >
            <User className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  )
}
