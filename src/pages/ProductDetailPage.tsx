import { useParams, Link } from 'react-router-dom'
import { useListingPath } from '@/features/listing/useListingPath'

export function ProductDetailPage() {
  const { id } = useParams<{ id: string }>()
  const backPath = useListingPath()

  const productId = Number(id)
  const isValidId = Number.isInteger(productId) && productId > 0

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-8 sm:px-6">
      <Link
        to={backPath}
        className="mb-6 inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50"
      >
        ← Back to Products
      </Link>

      <div className="rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        {!isValidId ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-red-700">
            <h1 className="text-xl font-bold">Invalid Product ID</h1>
            <p className="mt-2 text-sm text-red-600">
              The product identifier "{id}" is not valid. Please check the URL or return to the
              catalog.
            </p>
          </div>
        ) : (
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">
              Product #{productId}
            </h1>
            <p className="mt-2 text-slate-500">Loading product specifications and reviews...</p>
          </div>
        )}
      </div>
    </div>
  )
}
