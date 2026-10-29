import type { ProductSummary } from '../types'

/**
 * Fields requested from the list endpoints via `select`.
 * `satisfies` makes the compiler reject any name that is not a `ProductSummary` key.
 */
const LISTING_FIELDS = [
  'id',
  'title',
  'price',
  'rating',
  'brand',
  'category',
  'thumbnail',
] as const satisfies readonly (keyof ProductSummary)[]

const LISTING_SELECT = LISTING_FIELDS.join(',')

/** Paging options. DummyJSON treats `limit=0` as "return everything", which is our default. */
export interface ProductsPaging {
  limit?: number
  skip?: number
}

/** Query-string params shared by every product list endpoint. */
export const toListParams = ({ limit = 0, skip = 0 }: ProductsPaging) => ({
  limit,
  skip,
  select: LISTING_SELECT,
})
