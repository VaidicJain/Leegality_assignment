import { Link } from 'react-router-dom'
import { useListingPath } from '@/features/listing/useListingPath'

export function NotFoundPage() {
  const homePath = useListingPath()

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 py-20 text-center">
      <div className="text-6xl font-extrabold text-blue-600">404</div>
      <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900">Page Not Found</h1>
      <p className="mt-2 text-slate-500">
        The page you are looking for doesn't exist or has been moved. You can return to the product
        listing.
      </p>
      <Link
        to={homePath}
        className="mt-6 inline-flex items-center rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-blue-700"
      >
        Back to Products
      </Link>
    </div>
  )
}
