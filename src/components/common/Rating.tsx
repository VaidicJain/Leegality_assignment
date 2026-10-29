interface RatingProps {
  value: number
  showValue?: boolean
  className?: string
}

export function Rating({ value, showValue = true, className = '' }: RatingProps) {
  // Clamp value between 0 and 5
  const clamped = Math.max(0, Math.min(5, value))
  const rounded = Math.round(clamped * 10) / 10

  return (
    <div
      className={`flex items-center gap-1.5 ${className}`}
      aria-label={`Rated ${rounded} out of 5 stars`}
    >
      <div className="flex items-center text-amber-500" aria-hidden="true">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = clamped >= star
          const half = !filled && clamped >= star - 0.5

          return (
            <svg
              key={star}
              className="h-4 w-4 fill-current"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              {half ? (
                <>
                  <defs>
                    <linearGradient id={`half-star-${star}`}>
                      <stop offset="50%" stopColor="currentColor" />
                      <stop offset="50%" stopColor="#e2e8f0" />
                    </linearGradient>
                  </defs>
                  <path
                    fill={`url(#half-star-${star})`}
                    d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                  />
                </>
              ) : (
                <path
                  className={filled ? 'text-amber-500' : 'text-slate-200'}
                  fill="currentColor"
                  d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z"
                />
              )}
            </svg>
          )
        })}
      </div>
      {showValue && (
        <span className="text-xs font-semibold text-slate-700">{rounded.toFixed(1)}</span>
      )}
    </div>
  )
}
