import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import App from '../../App'
import { AuthProvider } from '../../context/AuthContext'

vi.mock('../../services/api', () => ({
  api: {
    login: vi.fn(),
    register: vi.fn(),
    getCurrentUser: vi.fn(),
    logout: vi.fn(),
    getUserGroups: vi.fn(),
    getUserProfile: vi.fn(),
    getGroupExpenses: vi.fn(),
  },
}))

describe('E2E web: fluxo autenticado', () => {
  let api

  beforeEach(async () => {
    api = (await import('../../services/api')).api
    vi.clearAllMocks()
    localStorage.clear()

    api.login.mockResolvedValue({ token: 'token-e2e', userId: 'auth-1' })
    api.getCurrentUser.mockResolvedValue({ _id: 'user-1', name: 'Ana', email: 'ana@teste.com' })
    api.getUserGroups.mockResolvedValue([
      {
        _id: 'group-1',
        name: 'Viagem',
        members: [{ userId: 'user-1' }, { userId: 'user-2' }],
      },
    ])
    api.getUserProfile.mockImplementation((userId) =>
      Promise.resolve({ _id: userId, name: userId === 'user-1' ? 'Ana' : 'Bruno' }),
    )
    api.getGroupExpenses.mockResolvedValue({
      expenses: [
        {
          _id: 'expense-1',
          description: 'Hospedagem',
          amount: 120,
          currency: 'BRL',
          paidBy: 'user-2',
          splits: [{ userId: 'user-1', amount: 60, status: 'pendente' }],
        },
      ],
    })
  })

  it('login leva o usuario ao dashboard e carrega resumo financeiro', async () => {
    const user = userEvent.setup()

    render(
      <AuthProvider>
        <MemoryRouter initialEntries={['/auth']}>
          <App />
        </MemoryRouter>
      </AuthProvider>,
    )

    await user.type(screen.getByLabelText(/e-mail/i), 'ana@teste.com')
    await user.type(screen.getByLabelText(/senha/i), 'senha123')
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await waitFor(() => {
      expect(screen.getByText('Olá, Ana!')).toBeInTheDocument()
    })

    expect(localStorage.getItem('token')).toBe('token-e2e')
    expect(api.getUserGroups).toHaveBeenCalledWith('user-1')
    expect(screen.getByText('Hospedagem')).toBeInTheDocument()
    expect(screen.getByText(/A pagar/)).toBeInTheDocument()
  })
})
