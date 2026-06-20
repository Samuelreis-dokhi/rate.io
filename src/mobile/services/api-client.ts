// src/mobile/src/services/api-client.ts
import Constants from 'expo-constants'
import { Platform } from 'react-native'
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

function getConfiguredApiBaseUrl(): string | undefined {
  const extra = Constants.expoConfig?.extra as { apiBaseUrl?: string } | undefined
  return extra?.apiBaseUrl || process.env.EXPO_PUBLIC_API_BASE_URL || undefined
}

function isLoopbackUrl(value: string): boolean {
  try {
    const { hostname } = new URL(value)
    return ['localhost', '127.0.0.1', '0.0.0.0', '[::1]', '::1'].includes(hostname)
  } catch {
    return false
  }
}

function getDevelopmentApiBaseUrl(): string | undefined {
  if (Platform.OS === 'web' && typeof window !== 'undefined') {
    return `${window.location.protocol}//${window.location.hostname}:3000`
  }

  const hostUri = Constants.expoConfig?.hostUri
  const host = hostUri?.split(':')[0]

  if (host) {
    return `http://${host}:3000`
  }

  return undefined
}

export function getApiBaseUrl(): string {
  const configuredApiBaseUrl = getConfiguredApiBaseUrl()
  const shouldInferDevUrl =
    __DEV__ &&
    Platform.OS !== 'web' &&
    configuredApiBaseUrl &&
    isLoopbackUrl(configuredApiBaseUrl)

  if (configuredApiBaseUrl && !shouldInferDevUrl) return configuredApiBaseUrl

  if (__DEV__) {
    const developmentApiBaseUrl = getDevelopmentApiBaseUrl()
    if (developmentApiBaseUrl) return developmentApiBaseUrl
  }

  if (configuredApiBaseUrl) return configuredApiBaseUrl

  throw new ApiError('EXPO_PUBLIC_API_BASE_URL não configurada', 0)
}

export async function request<T = unknown>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const apiBaseUrl = getApiBaseUrl()
  const token = await getToken()
  const isFormData =
    typeof FormData !== 'undefined' &&
    options.body != null &&
    (
      options.body instanceof FormData ||
      Object.prototype.toString.call(options.body) === '[object FormData]'
    )

  const response = await fetch(`${apiBaseUrl}${endpoint}`, {
    ...options,
    headers: {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options.headers as Record<string, string>) || {}),
    },
  })

  const data = await response.json().catch(() => ({}))

  if (!response.ok) {
    if (response.status === 401) {
      await clearSession()
    }
    const message =
      (data as { message?: string; error?: string }).message ??
      (data as { message?: string; error?: string }).error ??
      'Erro na requisição'
    throw new ApiError(message, response.status, data)
  }

  return data as T
}
