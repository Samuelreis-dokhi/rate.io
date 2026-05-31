import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import ProtectedRoute from '../../components/ProtectedRoute'
import { MemoryRouter, Route, Routes } from 'react-router-dom'

vi.mock('../../context/useAuth', () => ({
  useAuth: vi.fn(),
}))

describe('ProtectedRoute', async () => {
  const { useAuth } = await import('../../context/useAuth')

  it('redireciona para /auth quando não autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: false, bootstrapping: false })

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <Routes>
          <Route
            path="/dashboard"
            element={(
              <ProtectedRoute>
                <div>Dashboard</div>
              </ProtectedRoute>
            )}
          />
          <Route path="/auth" element={<div>Tela de login</div>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument()
    expect(screen.getByText('Tela de login')).toBeInTheDocument()
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

  it('renderiza conteudo protegido quando autenticado', () => {
    useAuth.mockReturnValue({ isAuthenticated: true, bootstrapping: false })

    render(
      <MemoryRouter>
        <ProtectedRoute>
          <div>Dashboard</div>
        </ProtectedRoute>
      </MemoryRouter>,
    )

    expect(screen.getByText('Dashboard')).toBeInTheDocument()
  })
})
