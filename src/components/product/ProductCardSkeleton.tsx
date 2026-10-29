export function ProductCardSkeleton() {
  return (
    <div className="flex h-full animate-pulse flex-col overflow-hidden rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      {/* Image skeleton */}
      <div className="aspect-square w-full rounded-lg bg-slate-200" />

      {/* Content skeleton */}
      <div className="mt-4 flex flex-1 flex-col">
        {/* Category badge skeleton */}
        <div className="h-3 w-16 rounded bg-slate-200" />

        {/* Title skeleton */}
        <div className="mt-2 h-4 w-5/6 rounded bg-slate-200" />
        <div className="mt-1.5 h-4 w-3/5 rounded bg-slate-200" />

        {/* Rating skeleton */}
        <div className="mt-3 flex items-center gap-1">
          <div className="h-3.5 w-20 rounded bg-slate-200" />
          <div className="h-3 w-6 rounded bg-slate-200" />
        </div>

        {/* Price skeleton */}
        <div className="mt-auto flex items-center justify-between pt-4">
          <div className="h-5 w-16 rounded bg-slate-200" />
          <div className="h-4 w-10 rounded bg-slate-200" />
        </div>
      </div>
    </div>
  )
}

interface ProductGridSkeletonProps {
  count?: number
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
  return (
    <div
      className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"
      aria-label="Loading products"
    >
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={index} />
      ))}
    </div>
  )
}
