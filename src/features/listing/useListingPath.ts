import { useAppSelector } from '@/app/hooks'
import { selectListingQuery } from './listingSelectors'

/** Listing URL that reflects the saved filters and page. Used by "Back to Products" and the brand link. */
export function useListingPath(): string {
  const query = useAppSelector(selectListingQuery)
  return query ? `/?${query}` : '/'
}
