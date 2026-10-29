import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProductSummary } from '@/services/types'
import { Rating } from '@/components/common/Rating'

interface ProductCardProps {
  product: ProductSummary
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  // Format price as standard dollar format ($699 or $999.99)
  const formattedPrice = `$${product.price % 1 === 0 ? product.price : product.price.toFixed(2)}`

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs transition-all duration-200 hover:shadow-md hover:border-slate-300">
      <Link
        to={`/product/${product.id}`}
        className="flex h-full flex-col p-4"
        aria-label={`View details for ${product.title}`}
      >
        {/* Product Image Container */}
        <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-slate-50 flex items-center justify-center mb-3">
          {imageError ? (
            <div className="flex h-full w-full items-center justify-center text-slate-300">
              <svg
                className="h-12 w-12"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="1.5"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
            </div>
          ) : (
            <img
              src={product.thumbnail}
              alt={product.title}
              loading="lazy"
              onError={() => setImageError(true)}
              className="h-full w-full object-contain p-2 transition-transform duration-300 group-hover:scale-105"
            />
          )}
        </div>

        {/* Content Container matching screenshot */}
        <div className="flex flex-1 flex-col justify-between">
          <h3 className="line-clamp-1 text-sm font-semibold text-slate-900 group-hover:text-blue-600">
            {product.title}
          </h3>

          <div className="mt-2 flex items-center gap-2">
            <span className="text-base font-bold text-slate-900">{formattedPrice}</span>
            <Rating value={product.rating} />
          </div>
        </div>
      </Link>
    </article>
  )
}
