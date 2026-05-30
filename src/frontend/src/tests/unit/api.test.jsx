import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { api } from '../../services/api'

describe('api service', () => {
  const originalGetItem = Storage.prototype.getItem

  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
    Storage.prototype.getItem = vi.fn()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
    Storage.prototype.getItem = originalGetItem
  })

  it('envia token no header Authorization quando existe token', async () => {
    Storage.prototype.getItem.mockReturnValue('token-123')

    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })

    const result = await api.getCurrentUser()

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/profile',
      expect.objectContaining({
        headers: expect.objectContaining({
          Authorization: 'Bearer token-123',
          'Content-Type': 'application/json',
        }),
      }),
    )
    expect(result).toEqual({ success: true })
  })

  it('lança erro quando resposta não está ok', async () => {
    Storage.prototype.getItem.mockReturnValue(null)

    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Falha' }),
    })

    await expect(api.getCurrentUser()).rejects.toThrow('Falha')
  })

  it('serializa payload de cadastro com metodo POST', async () => {
    Storage.prototype.getItem.mockReturnValue(null)
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ id: 'user-1' }),
    })

    await api.register({ name: 'Ana', email: 'ana@teste.com', password: 'senha123' })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/auth/register',
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ name: 'Ana', email: 'ana@teste.com', password: 'senha123' }),
      }),
    )
  })

  it('usa mensagem padrao quando backend falha sem corpo JSON', async () => {
    Storage.prototype.getItem.mockReturnValue(null)
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: async () => {
        throw new Error('sem json')
      },
    })

    await expect(api.getCurrentUser()).rejects.toThrow('Erro na requisição')
  })

  it('envia payload de liquidacao com token bearer', async () => {
    Storage.prototype.getItem.mockReturnValue('token-456')
    globalThis.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ message: 'ok' }),
    })

    await api.settleExpenseShare('expense-1', { userId: 'user-2', paidBy: 'user-1' })

    expect(globalThis.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/expenses/expense-1/settle',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer token-456',
          'Content-Type': 'application/json',
        }),
        body: JSON.stringify({ userId: 'user-2', paidBy: 'user-1' }),
      }),
    )
  })
})
