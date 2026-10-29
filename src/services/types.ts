/** Shapes of the DummyJSON responses used by this app (only the fields we read). */

export interface Category {
  slug: string
  name: string
  url: string
}

export interface Review {
  rating: number
  comment: string
  date: string
  reviewerName: string
}

/** Fields returned by the list endpoints (trimmed with `select` to keep payloads small). */
export interface ProductSummary {
  id: number
  title: string
  price: number
  rating: number
  brand?: string
  category: string
  thumbnail: string
}

/** Full product returned by `GET /products/{id}`. */
export interface Product extends ProductSummary {
  description: string
  images: string[]
  reviews: Review[]
}

export interface ProductListResponse {
  products: ProductSummary[]
  total: number
  skip: number
  limit: number
}
