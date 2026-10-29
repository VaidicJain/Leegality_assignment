import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { describe, expect, it } from 'vitest'
import { setupStore } from '@/app/store'
import { AppRoutes } from '@/App'
import { initialListingState } from '@/features/listing/listingSlice'

function renderWithProviders(
  initialEntries: string[] = ['/'],
  preloadedListing = initialListingState,
) {
  const store = setupStore({ listing: preloadedListing })
  return {
    store,
    ...render(
      <Provider store={store}>
        <MemoryRouter initialEntries={initialEntries}>
          <AppRoutes />
        </MemoryRouter>
      </Provider>,
    ),
  }
}

describe('App Routing and Layout', () => {
  it('renders Header, ListingPage, and Footer on root route "/"', () => {
    renderWithProviders(['/'])

    expect(screen.getByRole('link', { name: /leegality store home/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /all products/i })).toBeInTheDocument()
    expect(screen.getByText(/frontend engineer assessment/i)).toBeInTheDocument()
  })

  it('renders ProductDetailPage for valid product route "/product/:id"', () => {
    renderWithProviders(['/product/42'])

    // Back link is always rendered; product enters loading (skeleton) while API resolves
    expect(screen.getByRole('link', { name: /back to products/i })).toBeInTheDocument()
    expect(screen.getByLabelText(/loading product details/i)).toBeInTheDocument()
  })

  it('renders invalid ID warning for non-numeric product ID', () => {
    renderWithProviders(['/product/invalid-id'])

    expect(
      screen.getByRole('heading', { level: 1, name: /invalid product id/i }),
    ).toBeInTheDocument()
    expect(
      screen.getByText(/the url contains an invalid product identifier/i),
    ).toBeInTheDocument()
  })

  it('renders NotFoundPage on unknown route', () => {
    renderWithProviders(['/non-existent-route'])

    expect(screen.getByText('404')).toBeInTheDocument()
    expect(screen.getByRole('heading', { level: 1, name: /page not found/i })).toBeInTheDocument()
    expect(screen.getByRole('link', { name: /back to products/i })).toBeInTheDocument()
  })

  it('preserves listing query parameters in "Back to Products" link', () => {
    const preloadedState = {
      category: 'smartphones',
      search: 'pixel',
      minPrice: 400,
      maxPrice: 900,
      brands: ['Google'],
      page: 2,
    }

    renderWithProviders(['/product/10'], preloadedState)

    const backLink = screen.getByRole('link', { name: /back to products/i })
    expect(backLink).toHaveAttribute(
      'href',
      expect.stringMatching(/\/\?category=smartphones.*q=pixel/),
    )
  })

  it('allows header search to update store and listing state', async () => {
    const user = userEvent.setup()
    const { store } = renderWithProviders(['/'])

    const searchInput = screen.getByRole('searchbox', { name: /search products/i })
    await user.type(searchInput, 'smart watch')

    const submitButton = screen.getByRole('button', { name: /submit search/i })
    await user.click(submitButton)

    expect(store.getState().listing.search).toBe('smart watch')
    expect(store.getState().listing.page).toBe(1)
  })
})
