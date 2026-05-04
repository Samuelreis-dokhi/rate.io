import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { api } from '../../services/api'

describe('api service', () => {
  const originalFetch = global.fetch
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

    global.fetch.mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    })

    const result = await api.getCurrentUser()

    expect(global.fetch).toHaveBeenCalledWith(
      'http://localhost:3000/api/users/profile',
      expect.objectContaining({
        method: undefined,
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

    global.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({ message: 'Falha' }),
    })

    await expect(api.getCurrentUser()).rejects.toThrow('Falha')
  })
})