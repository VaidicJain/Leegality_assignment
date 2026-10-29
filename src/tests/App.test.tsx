import { render, screen } from '@testing-library/react'
import { Provider } from 'react-redux'
import { describe, expect, it } from 'vitest'
import { setupStore } from '@/app/store'
import App from '@/App'

describe('App', () => {
  it('renders the shell inside the Redux provider', () => {
    render(
      <Provider store={setupStore()}>
        <App />
      </Provider>,
    )

    expect(screen.getByRole('heading', { name: /leegality store/i })).toBeInTheDocument()
  })
})
