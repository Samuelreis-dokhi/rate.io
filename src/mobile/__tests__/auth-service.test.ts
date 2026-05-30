import { changePassword, login, register } from '../src/features/auth/auth-service'
import { request } from '../services/api-client'

jest.mock('../services/api-client', () => ({
  request: jest.fn(),
}))

const mockedRequest = request as jest.Mock

describe('auth-service', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
    mockedRequest.mockResolvedValue({})
  })

  it('envia login para o endpoint publico da API', async () => {
    const payload = { email: 'ana@teste.com', password: 'senha123' }

    await login(payload)

    expect(mockedRequest).toHaveBeenCalledWith('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  })

  it('envia cadastro com nome, email e senha', async () => {
    const payload = { name: 'Ana', email: 'ana@teste.com', password: 'senha123' }

    await register(payload)

    expect(mockedRequest).toHaveBeenCalledWith('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
  })

  it('usa PUT para manter contrato com o backend na troca de senha', async () => {
    const payload = {
      currentPassword: 'senha123',
      newPassword: 'nova123',
      confirmPassword: 'nova123',
    }

    await changePassword(payload)

    expect(mockedRequest).toHaveBeenCalledWith('/api/auth/change-password', {
      method: 'PUT',
      body: JSON.stringify(payload),
    })
  })
})
