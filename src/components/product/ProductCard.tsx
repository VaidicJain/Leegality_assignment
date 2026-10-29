import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { ProductSummary } from '@/services/types'
import { Rating } from '@/components/common/Rating'

interface ProductCardProps {
  product: ProductSummary
}

export function ProductCard({ product }: ProductCardProps) {
  const [imageError, setImageError] = useState(false)

  // Format price as standard currency (e.g. $9.99)
  const formattedPrice = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(product.price)

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all duration-200 hover:-translate-y-1 hover:border-slate-300 hover:shadow-md">
      <Link
        to={`/product/${product.id}`}
        className="flex h-full flex-col"
        aria-label={`View details for ${product.title}`}
      >
        {/* Product Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
          {imageError ? (
            <div className="flex h-full w-full items-center justify-center bg-slate-100 text-slate-400">
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
              className="h-full w-full object-contain p-4 transition-transform duration-300 group-hover:scale-105"
            />
          )}

          {product.brand && (
            <span className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-0.5 text-[11px] font-medium text-slate-700 shadow-sm backdrop-blur-xs">
              {product.brand}
            </span>
          )}
        </div>

        {/* Content Container */}
        <div className="flex flex-1 flex-col p-4">
          <div className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-slate-600">
            {product.category}
          </div>

          <h3 className="line-clamp-2 text-sm font-semibold text-slate-900 group-hover:text-blue-600">
            {product.title}
          </h3>

          <div className="mt-2 mb-3">
            <Rating value={product.rating} />
          </div>

          <div className="mt-auto flex items-baseline justify-between pt-2">
            <span className="text-lg font-bold text-slate-900">{formattedPrice}</span>
            <span className="text-xs font-semibold text-blue-600 group-hover:underline">
              View &rarr;
            </span>
          </div>
        </div>
      </Link>
    </article>
  )
}
