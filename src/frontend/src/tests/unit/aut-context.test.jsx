import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import { AuthProvider } from '../../context/AuthContext'
import { useAuth } from '../../context/useAuth'

vi.mock('../../services/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
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
      <span>{String(isAuthenticated)}</span>
      <span>{user?.email ?? 'no-user'}</span>
      <span>{String(bootstrapping)}</span>
    </div>
  )
}

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('faz login e salva token no localStorage', async () => {
    const { api } = await import('../../services/api')
    api.login.mockResolvedValue({ token: 'token-123', authId: 'user-1' })
    api.getCurrentUser.mockResolvedValue({ email: 'test@teste.com' })

    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    screen.getByText('login').click()

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBe('token-123')
      expect(screen.getByText('true')).toBeInTheDocument()
      expect(screen.getByText('test@teste.com')).toBeInTheDocument()
    })
  })

  it('faz logout e limpa localStorage', async () => {
    localStorage.setItem('token', 'token-123')
    render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.queryByText('false')).not.toBeNull()
    })

    screen.getByText('logout').click()

    await waitFor(() => {
      expect(localStorage.getItem('token')).toBeNull()
      expect(screen.getByText('false')).toBeInTheDocument()
    })
  })
})
