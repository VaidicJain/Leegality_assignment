import { ErrorState } from '@/components/common/ErrorState'
import { Rating } from '@/components/common/Rating'
import { useListingPath } from '@/features/listing/useListingPath'
import { getApiErrorMessage, isNotFoundError } from '@/services/errors'
import { useGetProductByIdQuery } from '@/services/queries'
import { skipToken } from '@reduxjs/toolkit/query'
import { ArrowLeft, Layers, Star, Tag } from 'lucide-react'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'

function ProductDetailSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-label="Loading product details">
      <div className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        {/* Image column */}
        <div className="flex flex-col gap-4">
          <div className="aspect-square w-full rounded-2xl bg-slate-200" />
          <div className="flex gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-20 w-20 rounded-lg bg-slate-200" />
            ))}
          </div>
        </div>
        {/* Info column */}
        <div className="flex flex-col gap-4 py-2">
          <div className="h-4 w-24 rounded bg-slate-200" />
          <div className="h-8 w-3/4 rounded bg-slate-200" />
          <div className="h-5 w-32 rounded bg-slate-200" />
          <div className="h-10 w-28 rounded bg-slate-200" />
          <div className="h-px bg-slate-200" />
          <div className="space-y-2">
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-full rounded bg-slate-200" />
            <div className="h-4 w-2/3 rounded bg-slate-200" />
          </div>
          <div className="h-px bg-slate-200" />
          <div className="flex gap-2">
            <div className="h-7 w-24 rounded-full bg-slate-200" />
            <div className="h-7 w-20 rounded-full bg-slate-200" />
          </div>
        </div>
      </div>
    </div>
  )
}

interface ThumbnailStripProps {
  images: string[]
  title: string
  activeIndex: number
  onSelect: (index: number) => void
}

function ThumbnailStrip({ images, title, activeIndex, onSelect }: ThumbnailStripProps) {
  if (images.length <= 1) return null
  return (
    <div className="flex gap-3 overflow-x-auto pb-1">
      {images.map((src, i) => (
        <button
          key={i}
          onClick={() => onSelect(i)}
          className={`h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border-2 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 ${
            i === activeIndex ? 'border-blue-500' : 'border-slate-200 hover:border-slate-400'
          }`}
          aria-label={`View image ${i + 1} of ${images.length}`}
          aria-pressed={i === activeIndex}
        >
          <img
            src={src}
            alt={`${title} — thumbnail ${i + 1}`}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </button>
      ))}
    </div>
  )
}

interface ReviewsProps {
  reviews: Array<{ rating: number; comment: string; date: string; reviewerName: string }>
}

function ReviewsSection({ reviews }: ReviewsProps) {
  if (reviews.length === 0) return null
  return (
    <section aria-labelledby="reviews-heading" className="mt-10">
      <h2 id="reviews-heading" className="mb-4 text-lg font-semibold text-slate-900">
        Customer Reviews
        <span className="ml-2 text-sm font-normal text-slate-500">({reviews.length})</span>
      </h2>
      <ul className="space-y-4">
        {reviews.map((review, i) => (
          <li key={i} className="rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
            <div className="flex items-center justify-between gap-4">
              <span className="font-medium text-slate-800">{review.reviewerName}</span>
              <Rating value={review.rating} showValue={false} />
            </div>
            <p className="mt-2 text-sm leading-relaxed text-slate-600">{review.comment}</p>
            <time dateTime={review.date} className="mt-2 block text-xs text-slate-400">
              {new Date(review.date).toLocaleDateString(undefined, {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
              })}
            </time>
          </li>
        ))}
      </ul>
    </section>
  )
}

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const backPath = useListingPath()

  const productId = Number(id)
  const isValidId = Number.isInteger(productId) && productId > 0

  const {
    data: product,
    isLoading,
    error,
    refetch,
  } = useGetProductByIdQuery(isValidId ? productId : skipToken)

  const [activeImage, setActiveImage] = useState(0)

  // Reset active image if product changes (e.g. user navigates between products)
  const imageList = product?.images?.length ? product.images : product ? [product.thumbnail] : []
  const safeActiveImage = activeImage < imageList.length ? activeImage : 0

  const formattedPrice =
    product != null
      ? new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(product.price)
      : ''

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      {/* ── Back button ── */}
      <Link
        to={backPath}
        className="mb-8 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 shadow-sm transition-colors hover:bg-blue-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
      >
        <ArrowLeft className="h-4 w-4" aria-hidden="true" />
        Back to Products
      </Link>

      {/* ── Invalid ID ── */}
      {!isValidId && (
        <div className="rounded-xl border border-red-200 bg-red-50 p-8 text-center">
          <h1 className="text-xl font-bold text-red-700">Invalid Product ID</h1>
          <p className="mt-2 text-sm text-red-600">
            The URL contains an invalid product identifier. Please return to the catalog.
          </p>
        </div>
      )}

      {/* ── Loading ── */}
      {isValidId && isLoading && (
        <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <ProductDetailSkeleton />
        </div>
      )}

      {/* ── 404 ── */}
      {isValidId && !isLoading && error && isNotFoundError(error) && (
        <div className="rounded-xl border border-slate-200 bg-white p-12 text-center shadow-sm">
          <p className="text-6xl">🔍</p>
          <h1 className="mt-4 text-2xl font-bold text-slate-900">Product Not Found</h1>
          <p className="mt-2 text-slate-500">
            No product with ID <strong>{productId}</strong> exists in the catalog.
          </p>
          <Link
            to={backPath}
            className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-blue-700"
          >
            <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            Back to Products
          </Link>
        </div>
      )}

      {/* ── Other error ── */}
      {isValidId && !isLoading && error && !isNotFoundError(error) && (
        <ErrorState message={getApiErrorMessage(error)} onRetry={refetch} />
      )}

      {/* ── Product detail ── */}
      {isValidId && !isLoading && product && (
        <article className="rounded-2xl border border-slate-200 bg-white shadow-sm">
          <div className="grid grid-cols-1 gap-0 lg:grid-cols-2">
            {/* ── Image panel ── */}
            <div className="flex flex-col gap-4 border-b border-slate-100 p-6 lg:border-b-0 lg:border-r lg:p-10">
              <div className="overflow-hidden rounded-2xl bg-slate-50">
                <img
                  src={imageList[safeActiveImage]}
                  alt={product.title}
                  className="aspect-square w-full object-contain p-4"
                  loading="eager"
                />
              </div>
              <ThumbnailStrip
                images={imageList}
                title={product.title}
                activeIndex={safeActiveImage}
                onSelect={setActiveImage}
              />
            </div>

            {/* ── Info panel ── */}
            <div className="flex flex-col gap-5 p-6 lg:p-10">
              {/* Category breadcrumb */}
              <div className="flex items-center gap-1.5 text-xs font-medium uppercase tracking-wider text-slate-400">
                <Layers className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{product.category}</span>
              </div>

              {/* Title */}
              <h1 className="text-2xl font-bold leading-snug tracking-tight text-slate-900 lg:text-3xl">
                {product.title}
              </h1>

              {/* Rating row */}
              <div className="flex items-center gap-3">
                <Rating value={product.rating} />
                <span className="text-sm text-slate-500">
                  {product.reviews.length} review{product.reviews.length !== 1 ? 's' : ''}
                </span>
              </div>

              {/* Price */}
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-extrabold text-slate-900">{formattedPrice}</span>
              </div>

              <hr className="border-slate-100" />

              {/* Description */}
              <div>
                <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider text-slate-500">
                  Description
                </h2>
                <p className="text-sm leading-7 text-slate-600">{product.description}</p>
              </div>

              <hr className="border-slate-100" />

              {/* Metadata chips */}
              <div className="flex flex-wrap gap-2">
                {product.brand && (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-700">
                    <Tag className="h-3 w-3" aria-hidden="true" />
                    {product.brand}
                  </span>
                )}
                <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-100 bg-blue-50 px-3 py-1 text-xs font-medium text-blue-700">
                  <Layers className="h-3 w-3" aria-hidden="true" />
                  {product.category}
                </span>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-amber-100 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-700">
                  <Star className="h-3 w-3 fill-amber-500" aria-hidden="true" />
                  {product.rating.toFixed(1)} / 5
                </span>
              </div>
            </div>
          </div>

          {/* ── Reviews ── */}
          <div className="border-t border-slate-100 px-6 pb-10 pt-6 lg:px-10">
            <ReviewsSection reviews={product.reviews} />
          </div>
        </article>
      )}
    </div>
  )
}
