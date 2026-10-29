import { useEffect, useRef } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector, useAppStore } from '@/app/hooks'
import { parseListingSearch } from './listingQuery'
import { selectListingQuery } from './listingSelectors'
import { listingRestored } from './listingSlice'

interface SyncSnapshot {
  url: string
  redux: string
}

/**
 * Keeps the listing URL and the Redux listing state in step.
 *
 * - Redux is the live state, so filters survive a trip to a product page and back.
 * - The URL makes a filtered view shareable and makes browser Back/Forward work.
 *
 * Who wins on a mismatch is decided by what changed since the previous run:
 * - URL changed (Back/Forward, pasted link): the URL wins and is loaded into Redux.
 * - Redux changed (user picked a filter): Redux wins and a history entry is pushed.
 * - First run: a URL with parameters wins (deep link); a bare `/` is filled from Redux
 *   (coming back from a product page) and replaces the entry instead of adding one.
 */
export function useListingUrlSync(): void {
  const dispatch = useAppDispatch()
  const store = useAppStore()
  const navigate = useNavigate()
  const { search } = useLocation()
  // Re-render trigger. The effect reads the latest state from the store to avoid stale values.
  const reduxQuery = useAppSelector(selectListingQuery)
  // Normalised so `%20` / `+` differences never look like a mismatch.
  const urlQuery = new URLSearchParams(search).toString()
  const previous = useRef<SyncSnapshot | null>(null)

  useEffect(() => {
    const currentRedux = selectListingQuery(store.getState())
    const last = previous.current
    previous.current = { url: urlQuery, redux: currentRedux }

    if (urlQuery === currentRedux) return

    const urlWins = last === null ? urlQuery !== '' : last.url !== urlQuery
    if (urlWins) {
      dispatch(listingRestored(parseListingSearch(urlQuery)))
      const normalised = selectListingQuery(store.getState())
      previous.current = { url: urlQuery, redux: normalised }
      // Invalid input (e.g. `?page=0`) is cleaned up in place.
      if (normalised !== urlQuery) navigate({ search: normalised }, { replace: true })
      return
    }

    const reduxChanged = last !== null && last.redux !== currentRedux
    navigate({ search: currentRedux }, { replace: !reduxChanged })
  }, [urlQuery, reduxQuery, store, dispatch, navigate])
}
