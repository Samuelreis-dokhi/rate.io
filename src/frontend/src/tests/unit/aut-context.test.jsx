import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { AuthProvider } from '../../context/AuthContext'
import { useAuth } from '../../context/useAuth'

vi.mock('../../services/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
  },
}))

const Consumer = () => {
  const { login, logout, isAuthenticated, user, bootstrapping } = useAuth()
  return (
    <div>
      <button onClick={() => login({ email: 'a', password: 'b' })}>
        login
      </button>
      <button onClick={logout}>logout</button>
      <span data-testid="is-authenticated">{String(isAuthenticated)}</span>
      <span data-testid="user-email">{user?.email ?? 'no-user'}</span>
      <span data-testid="bootstrapping">{String(bootstrapping)}</span>
    </div>
  )
}

describe('AuthContext', () => {
  let api

  beforeEach(async () => {
    api = (await import('../../services/api')).api
    vi.clearAllMocks()
    localStorage.clear()
  })

  it('faz login e salva token no localStorage', async () => {
    api.login.mockResolvedValue({ token: 'token-123', authId: 'user-1' })
    api.getCurrentUser.mockResolvedValue({ email: 'test@teste.com' })
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    await user.click(screen.getByText('login'))

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('token-123')
      expect(screen.getByText('true')).toBeInTheDocument()
      expect(screen.getByText('test@teste.com')).toBeInTheDocument()
    })
  })

  it('faz logout e limpa localStorage', async () => {
    localStorage.setItem('token', 'token-123')
    api.getCurrentUser.mockResolvedValue({ email: 'test@teste.com' })
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
    })

    await user.click(screen.getByText('logout'))

    await waitFor(() => {
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user-email')).toHaveTextContent('no-user')
      expect(screen.getByTestId('bootstrapping')).toHaveTextContent('false')
    })
  })

  it('restaura usuario quando token salvo ainda é valido', async () => {
    localStorage.setItem('token', 'token-salvo')
    api.getCurrentUser.mockResolvedValue({ email: 'salvo@teste.com' })

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(api.getCurrentUser).toHaveBeenCalled()
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user-email')).toHaveTextContent('salvo@teste.com')
    })
  })

  it('remove token salvo quando bootstrap falha', async () => {
    localStorage.setItem('token', 'token-expirado')
    localStorage.setItem('authId', 'auth-1')
    api.getCurrentUser.mockRejectedValue(new Error('Não autorizado'))

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
      expect(localStorage.getItem('authId')).toBeNull()
      expect(screen.getByTestId('is-authenticated')).toHaveTextContent('false')
    })
  })
})
