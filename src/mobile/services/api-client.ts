// src/mobile/src/services/api-client.ts
import { clearSession, getToken } from './storage'

export class ApiError extends Error {
  status: number
  data: unknown

  constructor(message: string, status: number, data: unknown = {}) {
    super(message)
    this.name = 'ApiError'
    this.status = status
    this.data = data
  }
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const apiBaseUrl = process.env.EXPO_PUBLIC_API_BASE_URL

  if (!apiBaseUrl) {
    throw new ApiError('EXPO_PUBLIC_API_BASE_URL não configurada', 0)
  }

  const token = await getToken()

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers as Record<string, string> || {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    // 401 = sessão expirada — limpa local e força re-login
    if (response.status === 401) {
      await clearSession()
    }
    const message = (data as { message?: string; error?: string }).message
      ?? (data as { message?: string; error?: string }).error
      ?? 'Erro na requisição'
    throw new ApiError(message, response.status, data)
  }

  return data as T
}