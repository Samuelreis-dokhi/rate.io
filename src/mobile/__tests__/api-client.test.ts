// src/mobile/__tests__/api-client.test.ts
import { request, ApiError } from '../services/api-client'

jest.mock('../services/storage', () => ({
  getToken: jest.fn().mockResolvedValue('token-teste'),
  clearSession: jest.fn().mockResolvedValue(undefined),
}))

// Simula EXPO_PUBLIC_API_BASE_URL
process.env.EXPO_PUBLIC_API_BASE_URL = 'http://localhost:3000'

describe('api-client', () => {
  beforeEach(() => {
    global.fetch = jest.fn()
  })

  it('retorna dados em resposta de sucesso', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve({ message: 'ok' }),
    })
    const data = await request('/health')
    expect(data).toEqual({ message: 'ok' })
  })

  it('lança ApiError com mensagem do backend', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ error: 'Payload inválido' }),
    })
    await expect(request('/api/groups')).rejects.toThrow('Payload inválido')
  })

  it('lança ApiError com status correto', async () => {
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ message: 'Não encontrado' }),
    })
    await expect(request('/api/grupos/inexistente')).rejects.toMatchObject({
      status: 404,
    })
  })

  it('limpa sessão em resposta 401', async () => {
    const { clearSession } = require('../services/storage')
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Não autorizado' }),
    })
    await expect(request('/api/privado')).rejects.toThrow()
    expect(clearSession).toHaveBeenCalled()
  })
})