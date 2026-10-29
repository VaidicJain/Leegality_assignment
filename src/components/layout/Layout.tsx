import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Footer } from './Footer'

export function Layout() {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 text-slate-900">
      <Header />
      <main className="flex w-full flex-1 flex-col">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}
