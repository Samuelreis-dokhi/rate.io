import { describe, it, expect, vi, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import AuthPage from '../../pages/AuthPage'
import { AuthProvider } from '../../context/AuthContext'

vi.mock('../../services/api', () => ({
  api: {
    register: vi.fn(),
    login: vi.fn(),
    getCurrentUser: vi.fn().mockResolvedValue(null),
  }  ,
}))

describe('AuthPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('alternar entre login e registro', async () => {
    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthPage />
        </AuthProvider>
      </MemoryRouter>,
 )
        
    expect(screen.getByRole('button', { name: /já tenho conta/i })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /criar conta/i })).toBeInTheDocument()
        
    userEvent.click(screen.getByRole('button', { name: /criar conta/i}) )
    expect(screen.getByLabelText(/nome/i)).toBeInTheDocument()

    userEvent.click(screen.getByRole('button', { name: /já tenho conta/i} ) )
    expect(screen.getByLabelText(/e-mail/i)).toBeInTheDocument() 
  }) 
    
    
  it('mostra erro de login quando falha', async () => {
    const { api } = await import('../../services/api')
    api.login.mockRejectedValue(new Error('Falha no login' ))

    render(
      <MemoryRouter>
        <AuthProvider>
          <AuthPage />
        </AuthProvider>
      </MemoryRouter>,
    )


    userEvent.type(screen.getByLabelText(/e-mail/i), 'user@teste.com')
    userEvent.type(screen.getByLabelText(/senha/i), 'senha123')
    userEvent.click(screen.getByRole('button', { name: /entrar/i }))

    const message = await screen.findByText(/falha no login/i)
    expect(message).toBeInTheDocument() 
   
   })

})
