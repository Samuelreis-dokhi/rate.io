import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { MemoryRouter } from 'react-router-dom'

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('ProtectedRoute', async () => {
  const { useAuth } = await import('../../context/useAuth')

  it('redireciona para /auth quando não autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, bootstrapping: false })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Dashboard</div>
        </ProtectedRoute>,
      </MemoryRouter>
    )

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
  })

  it('mostra carregando enquanto bootstrapping', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, bootstrapping: true })

    render(
      <ProtectedRoute>
        <div>Dashboard</div>
      </ProtectedRoute>,
    )

    expect(screen.getByText(/carregando painel/i)).toBeInTheDocument()
  })
})