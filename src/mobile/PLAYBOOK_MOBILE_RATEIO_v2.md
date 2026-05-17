# Playbook de Desenvolvimento Mobile — RATE.IO v2.0
> Reformulado a partir da análise do código real em `src.zip`.
> **Stack real:** Expo SDK 54 · Expo Router v6 · TypeScript · `expo-secure-store` · React Native 0.81

---

## Diagnóstico do Estado Atual

O projeto mobile existe e já tem dependências instaladas. O playbook anterior foi escrito para **React Navigation clássico + JavaScript**. O projeto real usa **Expo Router (file-based routing) + TypeScript**. Este documento reformula tudo com base na stack real.

**O que já existe e está correto:**
| Arquivo | Status |
|---|---|
| `package.json` | ✅ Dependências corretas (expo-router, expo-secure-store, reanimated, gesture-handler) |
| `app.json` | ✅ `newArchEnabled: true`, `typedRoutes: true`, `reactCompiler: true` |
| `constants/theme.ts` | ✅ `Colors` e `Fonts` definidos |
| `hooks/use-color-scheme.ts` | ✅ Implementado |
| `.env` | ✅ `EXPO_PUBLIC_API_BASE_URL=http://localhost:3000` |

**O que precisa ser construído (as 3 Sprints):**
Toda a pasta `src/` (services, features, components), substituição das telas de template em `app/`, e o sistema de autenticação.

---

## Princípios de Arquitetura (não negociáveis)

1. **Expo Router** — navegação via sistema de arquivos em `app/`. Não instalar React Navigation separado.
2. **TypeScript** — todos os arquivos novos em `.tsx` ou `.ts`.
3. **`expo-secure-store`** — único lugar onde o token é salvo. Nunca `AsyncStorage` para dados sensíveis.
4. **`EXPO_PUBLIC_API_BASE_URL`** — a única fonte da URL base. Nunca hardcodar.
5. **Perfil via `GET /api/users/profile`** — o `userId` retornado no login é do modelo `Auth`. Para grupos e despesas, sempre usar o `_id` do perfil `User`.
6. **Envelopes REST** — `getGroupExpenses` retorna `{ expenses: [] }`, `getGroupBalance` retorna `{ balance: {} }`. Extrair antes de usar.
7. **`status === 'pendente'`** — nunca `'owed'`. O backend usa português.
8. **Sem cálculo financeiro no mobile** — saldo vem da API. O app só exibe.

---

## Design System Mobile

O frontend web usa estas variáveis de cor. O mobile deve replicar a mesma paleta via `constants/theme.ts`:

```ts
// constants/theme.ts — VERSÃO ATUALIZADA
export const Colors = {
  light: {
    // Texto
    textPrimary: '#14142b',
    textSecondary: '#5f5f74',
    // Superfícies
    canvas: '#f7f8fd',
    surface: '#ffffff',
    border: '#e8e8f5',
    // Acento
    accent: '#aa3bff',
    accentDeep: '#4f33c7',
    accentBg: 'rgba(170, 59, 255, 0.10)',
    // Semânticas
    positive: '#0c7c4f',
    negative: '#c81f1f',
    // Tabs e ícones
    tint: '#4f33c7',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#4f33c7',
  },
  dark: {
    textPrimary: '#ECEDEE',
    textSecondary: '#9BA1A6',
    canvas: '#0f0f1a',
    surface: '#1a1a2e',
    border: '#2a2a3e',
    accent: '#aa3bff',
    accentDeep: '#7c5ce8',
    accentBg: 'rgba(170, 59, 255, 0.15)',
    positive: '#2ecc8a',
    negative: '#ff6b6b',
    tint: '#7c5ce8',
    tabIconDefault: '#9BA1A6',
    tabIconSelected: '#7c5ce8',
  },
}

export const Spacing = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
}

export const Radius = {
  sm: 8, md: 12, lg: 18, xl: 24, full: 999,
}

export const Typography = {
  display: { fontSize: 28, fontWeight: '700' as const, letterSpacing: -0.5 },
  h1:      { fontSize: 22, fontWeight: '700' as const },
  h2:      { fontSize: 18, fontWeight: '700' as const },
  h3:      { fontSize: 15, fontWeight: '700' as const },
  body:    { fontSize: 14, fontWeight: '400' as const, lineHeight: 20 },
  caption: { fontSize: 12, fontWeight: '400' as const },
  label:   { fontSize: 11, fontWeight: '600' as const, letterSpacing: 0.08 },
}
```

---

## Estrutura de Arquivos Final

```
src/mobile/
├── app/                              ← Expo Router (navegação por arquivos)
│   ├── _layout.tsx                   ← Root layout com AuthProvider
│   ├── (auth)/
│   │   ├── _layout.tsx               ← Stack de auth (sem tabs)
│   │   ├── login.tsx                 ← Tela de login
│   │   └── register.tsx              ← Tela de cadastro
│   └── (app)/
│       ├── _layout.tsx               ← Bottom tabs (autenticado)
│       ├── index.tsx                 ← Dashboard (tab Home)
│       ├── groups/
│       │   ├── index.tsx             ← Lista de grupos (tab Grupos)
│       │   └── [groupId].tsx         ← Detalhe do grupo
│       ├── activities.tsx            ← Feed de atividades (tab)
│       └── profile.tsx               ← Perfil do usuário (tab)
├── src/
│   ├── services/
│   │   ├── api-client.ts             ← Wrapper HTTP centralizado
│   │   └── storage.ts                ← expo-secure-store
│   ├── features/
│   │   ├── auth/
│   │   │   ├── auth-context.tsx      ← Context + Provider + useAuth
│   │   │   ├── auth-service.ts       ← login, register
│   │   │   └── user-service.ts       ← getCurrentUser, getUserProfile
│   │   ├── groups/
│   │   │   └── group-service.ts      ← CRUD grupos
│   │   └── expenses/
│   │       └── expense-service.ts    ← CRUD despesas + saldo + settle
│   ├── components/
│   │   ├── ui/
│   │   │   ├── stat-card.tsx         ← Card de estatística
│   │   │   ├── pending-card.tsx      ← Card de pendência
│   │   │   ├── activity-item.tsx     ← Item de atividade
│   │   │   ├── empty-state.tsx       ← Estado vazio
│   │   │   ├── app-button.tsx        ← Botão primário
│   │   │   ├── app-input.tsx         ← Input de texto
│   │   │   ├── section-header.tsx    ← Cabeçalho de seção
│   │   │   └── toast.tsx             ← Notificação flutuante
│   │   ├── expense-form.tsx          ← Formulário de despesa
│   │   └── member-list.tsx           ← Lista de membros
│   └── utils/
│       ├── format.ts                 ← formatMoney, formatDate
│       └── resolve-user-id.ts        ← helper para extrair _id
├── constants/
│   └── theme.ts                      ← (atualizar com paleta acima)
├── __tests__/
│   ├── api-client.test.ts
│   ├── auth-service.test.ts
│   └── group-service.test.ts
├── .env                              ← EXPO_PUBLIC_API_BASE_URL
└── app.json
```

---

## Contratos REST (fonte da verdade — verificado no código real)

### Auth
| Método | Rota | Body | Resposta |
|---|---|---|---|
| POST | `/api/auth/register` | `{ name, email, password }` | `{ message, authId, id, name, email }` |
| POST | `/api/auth/login` | `{ email, password }` | `{ message, token, userId }` |
| PUT | `/api/auth/change-password` | `{ currentPassword, newPassword, confirmPassword }` | `{ message }` |

> ⚠️ `userId` no login é o `_id` do modelo `Auth`. Não usar em grupos/despesas.

### Users
| Método | Rota | Uso |
|---|---|---|
| GET | `/api/users/profile` | Perfil autenticado — retorna o `User` com `_id` funcional |
| PUT | `/api/users/profile` | Atualiza nome/avatarUrl |
| GET | `/api/users/:userId` | Perfil público de membro (sem autenticação) |

### Groups
| Método | Rota | Body/Query | Resposta |
|---|---|---|---|
| POST | `/api/groups` | `{ name, description?, createdBy, membersIds? }` | grupo criado |
| GET | `/api/groups/user/:userId` | — | `Group[]` |
| POST | `/api/groups/:groupId/invite` | `{ email, addedBy }` | grupo atualizado |
| GET | `/api/groups/:groupId/activities` | `?userId=&limit=` | `Activity[]` |
| DELETE | `/api/groups/:groupId` | `{ userId }` no body | `{ message }` |

### Expenses
| Método | Rota | Body/Query | Resposta |
|---|---|---|---|
| POST | `/api/expenses` | ver abaixo | `{ message, expense }` |
| GET | `/api/expenses/group/:groupId` | `?userId=` | **`{ expenses: [] }`** |
| GET | `/api/expenses/group/:groupId/balances` | `?userId=` | **`{ balance: { totalPaid, totalOwed, netBalance, summary } }`** |
| POST | `/api/expenses/:expenseId/settle` | `{ userId, paidBy }` | `{ message }` |
| PUT | `/api/expenses/:expenseId` | campos a atualizar | `{ message, expense }` |
| DELETE | `/api/expenses/:expenseId` | `{ userId }` | `{ message }` |

**Body de criação de despesa:**
```json
{
  "groupId": "ObjectId",
  "description": "string",
  "amount": 150.00,
  "currency": "BRL",
  "paidBy": "userId-do-User-model",
  "createdBy": "userId-do-User-model",
  "splitType": "igual | porcentagem | exato",
  "splitsData": [
    { "userId": "ObjectId" },
    { "userId": "ObjectId", "percentage": 40 },
    { "userId": "ObjectId", "amount": 75.00 }
  ]
}
```

---

# Milestone 1 — Sprint 1: Fundação e Autenticação
**11/05 a 17/05/2026**

**Objetivo:** App Expo rodando, sistema de auth completo com sessão persistida, navegação separando fluxo público/privado via Expo Router, telas de login e cadastro integradas ao backend real.

---

## Issue 1.1 — Reset e estrutura do projeto

**Branch:** `feature/mobile-setup`
**Tempo estimado:** 2h

O projeto atual tem as telas de template do Expo (`index.tsx`, `explore.tsx`). A primeira tarefa é substituir pela estrutura correta.

### Passo 1 — Limpar telas de template

```bash
cd src/mobile
# Remove as telas de exemplo
rm app/(tabs)/index.tsx app/(tabs)/explore.tsx app/(tabs)/_layout.tsx
rm app/modal.tsx
rmdir app/\(tabs\) 2>/dev/null || true

# Cria a estrutura de pastas correta
mkdir -p app/\(auth\)
mkdir -p app/\(app\)/groups
mkdir -p src/services src/features/auth src/features/groups src/features/expenses
mkdir -p src/components/ui
mkdir -p src/utils
mkdir -p __tests__
```

### Passo 2 — Criar `src/utils/format.ts`

```ts
// src/mobile/src/utils/format.ts

export function formatMoney(value: number | string, currency = 'BRL'): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency,
  }).format(Number(value || 0))
}

export function formatDate(value: string | Date | null): string {
  if (!value) return ''
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
```

### Passo 3 — Criar `src/utils/resolve-user-id.ts`

```ts
// src/mobile/src/utils/resolve-user-id.ts
// O objeto user pode vir em formatos diferentes dependendo do estado do bootstrap.
// Este helper garante que sempre extraímos o _id correto.

export function resolveUserId(user: Record<string, unknown> | null): string {
  if (!user) return ''
  return String(
    user._id ??
    user.id ??
    (user.user as Record<string, unknown>)?._id ??
    ''
  )
}
```

### Passo 4 — Atualizar `constants/theme.ts`

Substituir pelo conteúdo da seção **Design System Mobile** deste playbook.

### Critérios de aceite
- [ ] Estrutura de pastas criada conforme especificado
- [ ] `npm run start` abre o Expo sem erros de compilação
- [ ] `constants/theme.ts` contém a paleta atualizada

---

## Issue 1.2 — Serviço HTTP e storage de sessão

**Branch:** `feature/mobile-api-client`
**Tempo estimado:** 2h
**Arquivo:** `src/mobile/src/services/api-client.ts` e `src/mobile/src/services/storage.ts`

### `src/services/storage.ts`

```ts
// src/mobile/src/services/storage.ts
import * as SecureStore from 'expo-secure-store'

const TOKEN_KEY = 'rateio.token'
const PROFILE_KEY = 'rateio.profile'

export async function saveToken(token: string): Promise<void> {
  await SecureStore.setItemAsync(TOKEN_KEY, token)
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY)
}

export async function saveProfile(profile: object): Promise<void> {
  await SecureStore.setItemAsync(PROFILE_KEY, JSON.stringify(profile))
}

export async function getProfile<T = object>(): Promise<T | null> {
  const value = await SecureStore.getItemAsync(PROFILE_KEY)
  return value ? JSON.parse(value) : null
}

export async function clearSession(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY)
  await SecureStore.deleteItemAsync(PROFILE_KEY)
}
```

### `src/services/api-client.ts`

```ts
// src/mobile/src/services/api-client.ts
import { clearSession, getToken } from './storage'

const API_BASE_URL = process.env.EXPO_PUBLIC_API_BASE_URL

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
  if (!API_BASE_URL) {
    throw new ApiError('EXPO_PUBLIC_API_BASE_URL não configurada', 0)
  }

  const token = await getToken()

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
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
```

### Teste: `__tests__/api-client.test.ts`

```ts
// src/mobile/__tests__/api-client.test.ts
import { request, ApiError } from '../src/services/api-client'

jest.mock('../src/services/storage', () => ({
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
    const { clearSession } = require('../src/services/storage')
    ;(fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 401,
      json: () => Promise.resolve({ message: 'Não autorizado' }),
    })
    await expect(request('/api/privado')).rejects.toThrow()
    expect(clearSession).toHaveBeenCalled()
  })
})
```

### Critérios de aceite
- [ ] Nenhuma tela ou service usa `fetch` diretamente
- [ ] Token é injetado automaticamente em toda requisição
- [ ] 401 chama `clearSession()` antes de lançar o erro
- [ ] `npm test` passa nos 4 casos acima

---

## Issue 1.3 — Contexto de autenticação

**Branch:** `feature/mobile-auth`
**Tempo estimado:** 3h

### `src/features/auth/auth-service.ts`

```ts
// src/mobile/src/features/auth/auth-service.ts
import { request } from '../../services/api-client'

interface LoginPayload { email: string; password: string }
interface RegisterPayload { name: string; email: string; password: string }

interface LoginResponse {
  message: string
  token: string
  userId: string // Auth._id — não usar em grupos/despesas
}

interface RegisterResponse {
  message: string
  authId: string
  id: string
  name: string
  email: string
}

export function login(payload: LoginPayload): Promise<LoginResponse> {
  return request('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function register(payload: RegisterPayload): Promise<RegisterResponse> {
  return request('/api/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function changePassword(payload: {
  currentPassword: string
  newPassword: string
  confirmPassword: string
}): Promise<{ message: string }> {
  return request('/api/auth/change-password', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}
```

### `src/features/auth/user-service.ts`

```ts
// src/mobile/src/features/auth/user-service.ts
import { request } from '../../services/api-client'

export interface UserProfile {
  _id: string
  name: string
  email: string
  authId: string
  avatarUrl: string | null
  isActive: boolean
}

export function getCurrentUser(): Promise<UserProfile> {
  return request('/api/users/profile')
}

export function updateProfile(payload: {
  name?: string
  avatarUrl?: string
}): Promise<{ message: string; id: string; name: string; avatarUrl: string | null }> {
  return request('/api/users/profile', {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function getPublicProfile(userId: string): Promise<UserProfile> {
  return request(`/api/users/${userId}`)
}
```

### `src/features/auth/auth-context.tsx`

```tsx
// src/mobile/src/features/auth/auth-context.tsx
import {
  createContext, useCallback, useContext, useEffect, useMemo, useState,
} from 'react'
import {
  clearSession, getProfile, getToken, saveProfile, saveToken,
} from '../../services/storage'
import * as authService from './auth-service'
import { getCurrentUser, type UserProfile } from './user-service'

interface AuthContextValue {
  user: UserProfile | null
  bootstrapping: boolean
  isAuthenticated: boolean
  login(payload: { email: string; password: string }): Promise<void>
  register(payload: { name: string; email: string; password: string }): Promise<void>
  logout(): Promise<void>
  refreshUser(): Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  // Ao montar: verifica sessão salva e carrega perfil
  useEffect(() => {
    async function bootstrap() {
      try {
        const token = await getToken()
        if (!token) return

        // Tenta usar perfil em cache primeiro (UX mais rápida)
        const cached = await getProfile<UserProfile>()
        if (cached) setUser(cached)

        // Valida token com a API e atualiza perfil
        const fresh = await getCurrentUser()
        await saveProfile(fresh)
        setUser(fresh)
      } catch {
        // Token expirado ou inválido — limpa sessão
        await clearSession()
        setUser(null)
      } finally {
        setBootstrapping(false)
      }
    }

    bootstrap()
  }, [])

  const login = useCallback(async (payload: { email: string; password: string }) => {
    // 1. Login → recebe token (userId aqui é Auth._id, não usar depois)
    const authData = await authService.login(payload)
    await saveToken(authData.token)

    // 2. Busca o perfil funcional (User._id é o que usamos no app)
    const profile = await getCurrentUser()
    await saveProfile(profile)
    setUser(profile)
  }, [])

  const register = useCallback(async (payload: {
    name: string; email: string; password: string
  }) => {
    await authService.register(payload)
    // Após registro, faz login automático
    await login({ email: payload.email, password: payload.password })
  }, [login])

  const logout = useCallback(async () => {
    await clearSession()
    setUser(null)
  }, [])

  const refreshUser = useCallback(async () => {
    const fresh = await getCurrentUser()
    await saveProfile(fresh)
    setUser(fresh)
  }, [])

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      bootstrapping,
      isAuthenticated: Boolean(user),
      login,
      register,
      logout,
      refreshUser,
    }),
    [user, bootstrapping, login, register, logout, refreshUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}
```

### Critérios de aceite
- [ ] Login salva token e perfil funcional
- [ ] Bootstrap usa cache local para UX rápida, valida com API logo depois
- [ ] 401 durante bootstrap limpa sessão e vai para tela de login
- [ ] `user._id` é sempre do modelo `User` (não `Auth`)

---

## Issue 1.4 — Root layout com AuthProvider e navegação por autenticação

**Branch:** `feature/mobile-auth` (mesma da 1.3)

### `app/_layout.tsx` — substituir pelo atual

```tsx
// src/mobile/app/_layout.tsx
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native'
import { Slot, useRouter, useSegments } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { useEffect } from 'react'
import 'react-native-reanimated'
import { AuthProvider, useAuth } from '@/src/features/auth/auth-context'
import { useColorScheme } from '@/hooks/use-color-scheme'

// Componente interno que redireciona com base no estado de auth
function AuthGate() {
  const { isAuthenticated, bootstrapping } = useAuth()
  const segments = useSegments()
  const router = useRouter()

  useEffect(() => {
    if (bootstrapping) return

    const inAuthGroup = segments[0] === '(auth)'
    const inAppGroup = segments[0] === '(app)'

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login')
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)')
    }
  }, [isAuthenticated, bootstrapping, segments])

  return <Slot />
}

export default function RootLayout() {
  const colorScheme = useColorScheme()

  return (
    <AuthProvider>
      <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
        <AuthGate />
        <StatusBar style='auto' />
      </ThemeProvider>
    </AuthProvider>
  )
}
```

### `app/(auth)/_layout.tsx`

```tsx
// src/mobile/app/(auth)/_layout.tsx
import { Stack } from 'expo-router'

export default function AuthLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name='login' />
      <Stack.Screen name='register' />
    </Stack>
  )
}
```

### `app/(app)/_layout.tsx`

```tsx
// src/mobile/app/(app)/_layout.tsx
import { Tabs } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors } from '@/constants/theme'
import { HapticTab } from '@/components/haptic-tab'
import { IconSymbol } from '@/components/ui/icon-symbol'

export default function AppLayout() {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: c.tint,
        tabBarInactiveTintColor: c.tabIconDefault,
        tabBarStyle: {
          backgroundColor: c.surface,
          borderTopColor: c.border,
        },
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name='index'
        options={{
          title: 'Início',
          tabBarIcon: ({ color }) => (
            <IconSymbol name='house.fill' size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='groups/index'
        options={{
          title: 'Grupos',
          tabBarIcon: ({ color }) => (
            <IconSymbol name='person.3.fill' size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='activities'
        options={{
          title: 'Atividades',
          tabBarIcon: ({ color }) => (
            <IconSymbol name='list.bullet' size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name='profile'
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => (
            <IconSymbol name='person.fill' size={26} color={color} />
          ),
        }}
      />
      {/* Esconde a rota de detalhe do grupo das tabs */}
      <Tabs.Screen name='groups/[groupId]' options={{ href: null }} />
    </Tabs>
  )
}
```

---

## Issue 1.5 — Componentes UI base

**Branch:** `feature/mobile-components`
**Tempo estimado:** 2h

### `src/components/ui/app-button.tsx`

```tsx
// src/mobile/src/components/ui/app-button.tsx
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'

interface AppButtonProps {
  title: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
}

export function AppButton({
  title, onPress, disabled, loading, variant = 'primary',
}: AppButtonProps) {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const styles = StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: Spacing.sm,
      borderRadius: Radius.full,
      paddingVertical: 13,
      paddingHorizontal: Spacing.lg,
      minHeight: 48,
      opacity: disabled || loading ? 0.55 : 1,
    },
    primary: { backgroundColor: c.accentDeep },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: c.accent,
    },
    ghost: { backgroundColor: c.accentBg },
    danger: { backgroundColor: 'rgba(200,31,31,0.08)', borderWidth: 1, borderColor: 'rgba(200,31,31,0.25)' },
    primaryText: { color: '#fff', ...Typography.h3 },
    outlineText: { color: c.accentDeep, ...Typography.h3 },
    ghostText: { color: c.accentDeep, ...Typography.h3 },
    dangerText: { color: '#c81f1f', ...Typography.h3 },
  })

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.base, styles[variant]]}
    >
      {loading && <ActivityIndicator color={variant === 'primary' ? '#fff' : c.accent} size='small' />}
      <Text style={styles[`${variant}Text`]}>{title}</Text>
    </Pressable>
  )
}
```

### `src/components/ui/app-input.tsx`

```tsx
// src/mobile/src/components/ui/app-input.tsx
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'

interface AppInputProps extends TextInputProps {
  label?: string
  error?: string
}

export function AppInput({ label, error, ...props }: AppInputProps) {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  return (
    <View style={{ gap: Spacing.xs }}>
      {label ? (
        <Text style={[Typography.label, { color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.08 }]}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: c.surface,
            borderColor: error ? '#c81f1f' : c.border,
            color: c.textPrimary,
          },
        ]}
        placeholderTextColor={c.textSecondary}
        {...props}
      />
      {error ? (
        <Text style={{ ...Typography.caption, color: '#c81f1f' }}>{error}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 48,
  },
})
```

### `src/components/ui/stat-card.tsx`

```tsx
// src/mobile/src/components/ui/stat-card.tsx
import { StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'

type Tone = 'neutral' | 'positive' | 'negative'

interface StatCardProps { label: string; value: string | number; tone?: Tone }

export function StatCard({ label, value, tone = 'neutral' }: StatCardProps) {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']
  const valueColor = tone === 'positive' ? c.positive : tone === 'negative' ? c.negative : c.textPrimary

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  label: {
    ...Typography.label,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
})
```

### `src/components/ui/empty-state.tsx`

```tsx
// src/mobile/src/components/ui/empty-state.tsx
import { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'

interface EmptyStateProps { icon?: string; message: string; action?: ReactNode }

export function EmptyState({ icon = '📭', message, action }: EmptyStateProps) {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  return (
    <View style={[styles.container, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[Typography.body, { color: c.textSecondary, textAlign: 'center' }]}>
        {message}
      </Text>
      {action}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.md,
    borderStyle: 'dashed',
  },
  icon: { fontSize: 32 },
})
```

### `src/components/ui/activity-item.tsx`

```tsx
// src/mobile/src/components/ui/activity-item.tsx
import { StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'
import { formatDate } from '@/src/utils/format'

const ICONS: Record<string, string> = {
  GROUP_CREATED: '🎉', MEMBER_ADDED: '👋', EXPENSE_CREATED: '💸',
  PAYMENT_SETTLED: '✅', EXPENSE_UPDATED: '✏️', EXPENSE_DELETED: '❌', GROUP_DELETED: '🗑️',
}

interface Activity {
  _id: string; type: string; message: string; createdAt: string
}

interface ActivityItemProps { activity: Activity; groupName?: string }

export function ActivityItem({ activity, groupName }: ActivityItemProps) {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  return (
    <View style={[styles.container, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: c.canvas, borderColor: c.border }]}>
        <Text style={styles.icon}>{ICONS[activity.type] ?? '📌'}</Text>
      </View>
      <View style={styles.body}>
        {groupName ? (
          <View style={[styles.badge, { backgroundColor: c.accentBg }]}>
            <Text style={[Typography.label, { color: c.accentDeep }]}>{groupName}</Text>
          </View>
        ) : null}
        <Text style={[Typography.body, { color: c.textPrimary }]}>{activity.message}</Text>
        <Text style={[Typography.caption, { color: c.textSecondary }]}>
          {formatDate(activity.createdAt)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  icon: { fontSize: 18 },
  body: { flex: 1, gap: Spacing.xs },
  badge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
})
```

---

## Issue 1.6 — Telas de Login e Cadastro

**Branch:** `feature/mobile-auth-screens`
**Tempo estimado:** 2h

### `app/(auth)/login.tsx`

```tsx
// src/mobile/app/(auth)/login.tsx
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { AppButton } from '@/src/components/ui/app-button'
import { AppInput } from '@/src/components/ui/app-input'

export default function LoginScreen() {
  const { login } = useAuth()
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleLogin() {
    setError('')
    if (!email.trim() || !password) {
      setError('Preencha email e senha.')
      return
    }
    setLoading(true)
    try {
      await login({ email: email.trim().toLowerCase(), password })
      // AuthGate no _layout cuida do redirect para /(app)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.canvas }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <View style={styles.header}>
          <Text style={[Typography.display, { color: c.accentDeep }]}>RATE.IO</Text>
          <Text style={[Typography.h2, { color: c.textPrimary, marginTop: Spacing.lg }]}>
            Bem-vindo de volta
          </Text>
          <Text style={[Typography.body, { color: c.textSecondary, marginTop: Spacing.xs }]}>
            Entre para gerenciar suas despesas.
          </Text>
        </View>

        <View style={styles.form}>
          <AppInput
            label='E-mail'
            placeholder='voce@exemplo.com'
            value={email}
            onChangeText={setEmail}
            keyboardType='email-address'
            autoCapitalize='none'
            autoCorrect={false}
          />
          <AppInput
            label='Senha'
            placeholder='••••••••'
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
          {error ? (
            <Text style={{ color: '#c81f1f', ...Typography.body }}>{error}</Text>
          ) : null}
          <AppButton
            title={loading ? 'Entrando...' : 'Entrar'}
            onPress={handleLogin}
            loading={loading}
            disabled={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[Typography.body, { color: c.textSecondary }]}>
            Não tem conta?{' '}
          </Text>
          <Link href='/(auth)/register'>
            <Text style={[Typography.body, { color: c.accentDeep, fontWeight: '700' }]}>
              Criar conta
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, padding: Spacing.lg, gap: Spacing.xl, justifyContent: 'center' },
  header: { gap: Spacing.xs },
  form: { gap: Spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
})
```

### `app/(auth)/register.tsx`

```tsx
// src/mobile/app/(auth)/register.tsx
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { AppButton } from '@/src/components/ui/app-button'
import { AppInput } from '@/src/components/ui/app-input'

export default function RegisterScreen() {
  const { register } = useAuth()
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleRegister() {
    setError('')
    if (!name.trim() || !email.trim() || !password) {
      setError('Preencha todos os campos.')
      return
    }
    if (password.length < 6) {
      setError('Senha deve ter no mínimo 6 caracteres.')
      return
    }
    setLoading(true)
    try {
      // register faz login automático — AuthGate redireciona para /(app)
      await register({ name: name.trim(), email: email.trim().toLowerCase(), password })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <KeyboardAvoidingView
      style={[styles.root, { backgroundColor: c.canvas }]}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps='handled'>
        <View style={styles.header}>
          <Text style={[Typography.display, { color: c.accentDeep }]}>RATE.IO</Text>
          <Text style={[Typography.h2, { color: c.textPrimary, marginTop: Spacing.lg }]}>
            Criar conta
          </Text>
          <Text style={[Typography.body, { color: c.textSecondary, marginTop: Spacing.xs }]}>
            Comece a dividir despesas de forma inteligente.
          </Text>
        </View>

        <View style={styles.form}>
          <AppInput label='Nome' placeholder='Seu nome' value={name} onChangeText={setName} />
          <AppInput
            label='E-mail' placeholder='voce@exemplo.com'
            value={email} onChangeText={setEmail}
            keyboardType='email-address' autoCapitalize='none' autoCorrect={false}
          />
          <AppInput
            label='Senha' placeholder='Mínimo 6 caracteres'
            value={password} onChangeText={setPassword} secureTextEntry
          />
          {error ? (
            <Text style={{ color: '#c81f1f', ...Typography.body }}>{error}</Text>
          ) : null}
          <AppButton
            title={loading ? 'Criando conta...' : 'Criar conta'}
            onPress={handleRegister}
            loading={loading}
            disabled={loading}
          />
        </View>

        <View style={styles.footer}>
          <Text style={[Typography.body, { color: c.textSecondary }]}>Já tem conta? </Text>
          <Link href='/(auth)/login'>
            <Text style={[Typography.body, { color: c.accentDeep, fontWeight: '700' }]}>
              Entrar
            </Text>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { flexGrow: 1, padding: Spacing.lg, gap: Spacing.xl, justifyContent: 'center' },
  header: { gap: Spacing.xs },
  form: { gap: Spacing.md },
  footer: { flexDirection: 'row', justifyContent: 'center', flexWrap: 'wrap' },
})
```

### Critérios de aceite da Sprint 1
- [ ] `npm run start` abre o app sem erros
- [ ] Não autenticado → vai para login automaticamente
- [ ] Login com credenciais corretas → vai para tab de início
- [ ] Cadastro → cria conta e já autentica
- [ ] Erros do backend aparecem na tela (não travam o app)
- [ ] Fechar e reabrir o app com sessão ativa → permanece autenticado
- [ ] `npm test` passa nos testes do `api-client`

---

# Milestone 2 — Sprint 2: Dashboard, Grupos e Atividades
**18/05 a 24/05/2026**

**Objetivo:** Dashboard com resumo financeiro real, listagem e detalhe de grupos, convite de membros e feed de atividades. Paridade funcional com o frontend web.

---

## Issue 2.1 — Services de grupos e expenses

**Branch:** `feature/mobile-services`
**Tempo estimado:** 1h

### `src/features/groups/group-service.ts`

```ts
// src/mobile/src/features/groups/group-service.ts
import { request } from '../../services/api-client'

export interface GroupMember {
  userId: string
  role: 'admin' | 'member'
  joinedAt: string
}

export interface Group {
  _id: string; name: string; description?: string
  createdBy: string; members: GroupMember[]; isActive: boolean; createdAt: string
}

export interface Activity {
  _id: string; groupId: string; actorUserId: string; type: string
  message: string; createdAt: string
}

export function getUserGroups(userId: string): Promise<Group[]> {
  return request(`/api/groups/user/${userId}`)
}

export function createGroup(payload: {
  name: string; description?: string; createdBy: string; membersIds?: string[]
}): Promise<Group> {
  return request('/api/groups', { method: 'POST', body: JSON.stringify(payload) })
}

export function inviteToGroup(groupId: string, payload: {
  email: string; addedBy: string
}): Promise<Group> {
  return request(`/api/groups/${groupId}/invite`, { method: 'POST', body: JSON.stringify(payload) })
}

export function getGroupActivities(groupId: string, userId: string, limit = 50): Promise<Activity[]> {
  return request(`/api/groups/${groupId}/activities?userId=${userId}&limit=${limit}`)
}

export function deleteGroup(groupId: string, userId: string): Promise<{ message: string }> {
  return request(`/api/groups/${groupId}`, { method: 'DELETE', body: JSON.stringify({ userId }) })
}
```

### `src/features/expenses/expense-service.ts`

```ts
// src/mobile/src/features/expenses/expense-service.ts
import { request } from '../../services/api-client'

export interface ExpenseSplit {
  userId: string; amount: number; percentage?: number; status: 'pendente' | 'pago'; paidAt: string | null
}

export interface Expense {
  _id: string; groupId: string; description: string; amount: number
  currency: string; paidBy: string; createdBy: string; splitType: string
  splits: ExpenseSplit[]; createdAt: string
}

export interface GroupBalance {
  totalPaid: number; totalOwed: number; netBalance: number
  summary: { userId: string; amount: number }[]
}

// Resposta enveloped: { expenses: [] }
export async function getGroupExpenses(groupId: string, userId: string): Promise<Expense[]> {
  const data = await request<{ expenses: Expense[] }>(
    `/api/expenses/group/${groupId}?userId=${userId}`
  )
  return data.expenses ?? []
}

// Resposta enveloped: { balance: {} }
export async function getGroupBalance(groupId: string, userId: string): Promise<GroupBalance> {
  const data = await request<{ balance: GroupBalance }>(
    `/api/expenses/group/${groupId}/balances?userId=${userId}`
  )
  return data.balance
}

export function createExpense(payload: {
  groupId: string; description: string; amount: number; currency: string
  paidBy: string; createdBy: string; splitType: string; splitsData: object[]
}): Promise<{ message: string; expense: Expense }> {
  return request('/api/expenses', { method: 'POST', body: JSON.stringify(payload) })
}

export function settleExpenseShare(expenseId: string, userId: string): Promise<{ message: string }> {
  return request(`/api/expenses/${expenseId}/settle`, {
    method: 'POST',
    body: JSON.stringify({ userId, paidBy: userId }), // backend exige ambos
  })
}

export function updateExpense(expenseId: string, payload: object): Promise<{ message: string; expense: Expense }> {
  return request(`/api/expenses/${expenseId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteExpense(expenseId: string, userId: string): Promise<{ message: string }> {
  return request(`/api/expenses/${expenseId}`, { method: 'DELETE', body: JSON.stringify({ userId }) })
}
```

---

## Issue 2.2 — Tela Dashboard (tab Início)

**Branch:** `feature/mobile-dashboard`

### `app/(app)/index.tsx`

```tsx
// src/mobile/app/(app)/index.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { getUserGroups, type Group } from '@/src/features/groups/group-service'
import { getGroupExpenses, type Expense } from '@/src/features/expenses/expense-service'
import { getPublicProfile } from '@/src/features/auth/user-service'
import { StatCard } from '@/src/components/ui/stat-card'
import { EmptyState } from '@/src/components/ui/empty-state'
import { AppButton } from '@/src/components/ui/app-button'
import { resolveUserId } from '@/src/utils/resolve-user-id'
import { formatMoney } from '@/src/utils/format'

export default function DashboardScreen() {
  const { user, logout } = useAuth()
  const userId = resolveUserId(user as Record<string, unknown>)
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [groups, setGroups] = useState<Group[]>([])
  const [profilesById, setProfilesById] = useState<Record<string, { name: string }>>({})
  const [expensesMap, setExpensesMap] = useState<Record<string, Expense[]>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!userId) return
    try {
      const gs = await getUserGroups(userId)
      setGroups(gs)

      // Perfis dos membros
      const ids = [...new Set(gs.flatMap((g) => g.members.map((m) => m.userId)))]
      const entries = await Promise.all(
        ids.map(async (id) => {
          try { return [id, await getPublicProfile(id)] }
          catch { return [id, { name: 'Membro' }] }
        })
      )
      setProfilesById(Object.fromEntries(entries))

      // Despesas de cada grupo
      const expEntries = await Promise.all(
        gs.map(async (g) => {
          try { return [g._id, await getGroupExpenses(g._id, userId)] }
          catch { return [g._id, [] as Expense[]] }
        })
      )
      setExpensesMap(Object.fromEntries(expEntries))
    } catch { /* silencioso no refresh */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [userId])

  useEffect(() => { load() }, [load])

  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [load])

  // status 'pendente' — backend usa português
  const stats = useMemo(() => {
    let totalOwed = 0, totalToReceive = 0, unsettled = 0
    for (const list of Object.values(expensesMap)) {
      for (const exp of list) {
        const mine = exp.splits.find((s) => s.userId === userId)
        if (mine?.status === 'pendente') { totalOwed += mine.amount; unsettled++ }
        if (exp.paidBy === userId) {
          for (const s of exp.splits) {
            if (s.userId !== userId && s.status === 'pendente') totalToReceive += s.amount
          }
        }
      }
    }
    return { totalOwed, totalToReceive, net: totalToReceive - totalOwed, groups: groups.length, unsettled }
  }, [expensesMap, userId, groups.length])

  const pendingPayments = useMemo(() => {
    const list: { expId: string; gId: string; gName: string; desc: string; amount: number; toName: string }[] = []
    for (const [gId, exps] of Object.entries(expensesMap)) {
      const gName = groups.find((g) => g._id === gId)?.name ?? 'Grupo'
      for (const exp of exps) {
        const mine = exp.splits.find((s) => s.userId === userId)
        if (mine?.status === 'pendente') {
          list.push({ expId: exp._id, gId, gName, desc: exp.description, amount: mine.amount, toName: profilesById[exp.paidBy]?.name ?? 'Membro' })
        }
      }
    }
    return list.sort((a, b) => b.amount - a.amount)
  }, [expensesMap, groups, profilesById, userId])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.canvas }]}>
        <Text style={[Typography.body, { color: c.textSecondary }]}>Carregando painel...</Text>
      </View>
    )
  }

  const netTone = stats.net > 0.01 ? 'positive' : stats.net < -0.01 ? 'negative' : 'neutral'

  return (
    <ScrollView
      style={{ backgroundColor: c.canvas }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={[Typography.h1, { color: c.textPrimary }]}>
            Olá, {user?.name ?? 'Usuário'}!
          </Text>
          <Text style={[Typography.body, { color: c.textSecondary }]}>
            Aqui está o seu resumo financeiro.
          </Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={[Typography.label, { color: c.accent }]}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* 4 stat cards */}
      <View style={styles.statsRow}>
        <StatCard label='A pagar' value={formatMoney(stats.totalOwed)} tone={stats.totalOwed > 0 ? 'negative' : 'neutral'} />
        <StatCard label='A receber' value={formatMoney(stats.totalToReceive)} tone={stats.totalToReceive > 0 ? 'positive' : 'neutral'} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label='Saldo líquido' value={formatMoney(stats.net)} tone={netTone} />
        <StatCard label='Grupos ativos' value={String(stats.groups)} />
      </View>

      {/* Atalhos */}
      <View style={styles.shortcuts}>
        <TouchableOpacity
          style={[styles.shortcut, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => router.push('/(app)/groups')}
        >
          <Text style={styles.shortcutIcon}>👥</Text>
          <Text style={[Typography.h3, { color: c.textPrimary }]}>Meus Grupos</Text>
          <Text style={[Typography.caption, { color: c.textSecondary }]}>Gerencie grupos de despesas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shortcut, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => router.push('/(app)/activities')}
        >
          <Text style={styles.shortcutIcon}>📋</Text>
          <Text style={[Typography.h3, { color: c.textPrimary }]}>Atividades</Text>
          <Text style={[Typography.caption, { color: c.textSecondary }]}>
            {stats.unsettled > 0 ? `${stats.unsettled} pendência(s)` : 'Tudo em dia!'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* O que preciso pagar */}
      <View style={styles.section}>
        <Text style={[Typography.h2, { color: c.textPrimary, marginBottom: Spacing.md }]}>
          O que você precisa pagar
        </Text>
        {pendingPayments.length === 0 ? (
          <EmptyState icon='🎉' message='Nenhum pagamento pendente. Tudo acertado!' />
        ) : (
          pendingPayments.map((item) => (
            <View key={item.expId} style={[styles.pendingCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.h3, { color: c.textPrimary }]}>{item.desc}</Text>
                <Text style={[Typography.caption, { color: c.textSecondary }]}>
                  {item.gName} · Para {item.toName}
                </Text>
              </View>
              <Text style={[Typography.h3, { color: c.negative }]}>{formatMoney(item.amount)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  shortcuts: { flexDirection: 'row', gap: Spacing.md },
  shortcut: { flex: 1, borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.md, gap: Spacing.xs },
  shortcutIcon: { fontSize: 24 },
  section: {},
  pendingCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
})
```

---

## Issue 2.3 — Lista e Detalhe de Grupos

**Branch:** `feature/mobile-groups`

### `app/(app)/groups/index.tsx`

```tsx
// src/mobile/app/(app)/groups/index.tsx
import { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { createGroup, getUserGroups, type Group } from '@/src/features/groups/group-service'
import { EmptyState } from '@/src/components/ui/empty-state'
import { AppButton } from '@/src/components/ui/app-button'
import { AppInput } from '@/src/components/ui/app-input'
import { resolveUserId } from '@/src/utils/resolve-user-id'

export default function GroupListScreen() {
  const { user } = useAuth()
  const userId = resolveUserId(user as Record<string, unknown>)
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    if (!userId) return
    try {
      const data = await getUserGroups(userId)
      setGroups(data)
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    } finally {
      setLoading(false); setRefreshing(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.name.trim()) { setFormError('Nome obrigatório'); return }
    setFormLoading(true); setFormError('')
    try {
      await createGroup({ name: form.name.trim(), description: form.description.trim(), createdBy: userId })
      setForm({ name: '', description: '' })
      setShowCreate(false)
      await load()
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setFormLoading(false)
    }
  }

  const filtered = search.trim()
    ? groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups

  return (
    <View style={[styles.root, { backgroundColor: c.canvas }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.canvas }]}>
        <Text style={[Typography.h1, { color: c.textPrimary }]}>Meus Grupos</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: c.accentDeep }]}
          onPress={() => setShowCreate(true)}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={{ padding: Spacing.lg, paddingTop: 0 }}>
        <TextInput
          style={[styles.search, { backgroundColor: c.surface, borderColor: c.border, color: c.textPrimary }]}
          placeholder='Buscar grupo...'
          placeholderTextColor={c.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: Spacing.lg, paddingTop: 0, gap: Spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} />}
        ListEmptyComponent={
          loading ? (
            <Text style={[Typography.body, { color: c.textSecondary, textAlign: 'center', paddingTop: 40 }]}>
              Carregando grupos...
            </Text>
          ) : (
            <EmptyState icon='👥' message='Você ainda não tem grupos. Crie o primeiro!' action={
              <AppButton title='Criar grupo' onPress={() => setShowCreate(true)} />
            } />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => router.push(`/(app)/groups/${item._id}`)}
          >
            <View style={styles.cardTop}>
              <Text style={[Typography.h2, { color: c.textPrimary, flex: 1 }]}>{item.name}</Text>
              <Text style={[Typography.caption, { color: c.accentDeep }]}>Abrir →</Text>
            </View>
            {item.description ? (
              <Text style={[Typography.body, { color: c.textSecondary }]}>{item.description}</Text>
            ) : null}
            <Text style={[Typography.caption, { color: c.textSecondary, marginTop: Spacing.xs }]}>
              {item.members.length} membro(s)
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal criar grupo */}
      <Modal visible={showCreate} animationType='slide' presentationStyle='pageSheet' onRequestClose={() => setShowCreate(false)}>
        <View style={[styles.modal, { backgroundColor: c.canvas }]}>
          <View style={styles.modalHeader}>
            <Text style={[Typography.h1, { color: c.textPrimary }]}>Novo grupo</Text>
            <TouchableOpacity onPress={() => { setShowCreate(false); setFormError('') }}>
              <Text style={[Typography.body, { color: c.accent }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: Spacing.md }}>
            <AppInput
              label='Nome *' placeholder='Ex: República PUC'
              value={form.name} onChangeText={(t) => setForm((c) => ({ ...c, name: t }))}
            />
            <AppInput
              label='Descrição' placeholder='Opcional'
              value={form.description} onChangeText={(t) => setForm((c) => ({ ...c, description: t }))}
            />
            {formError ? <Text style={{ color: '#c81f1f', ...Typography.body }}>{formError}</Text> : null}
            <AppButton title={formLoading ? 'Criando...' : 'Criar grupo'} onPress={handleCreate} loading={formLoading} disabled={formLoading} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
  addBtn: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  search: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, fontSize: 15 },
  card: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.xs },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modal: { flex: 1, padding: Spacing.lg, gap: Spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
})
```

---

## Issue 2.4 — Detalhe do Grupo

**Branch:** `feature/mobile-group-detail`

### `app/(app)/groups/[groupId].tsx`

```tsx
// src/mobile/app/(app)/groups/[groupId].tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Modal, SectionList, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import {
  deleteGroup, getGroupActivities, getUserGroups, inviteToGroup, type Activity, type Group,
} from '@/src/features/groups/group-service'
import {
  getGroupBalance, getGroupExpenses, settleExpenseShare, type Expense, type GroupBalance,
} from '@/src/features/expenses/expense-service'
import { getPublicProfile, type UserProfile } from '@/src/features/auth/user-service'
import { StatCard } from '@/src/components/ui/stat-card'
import { ActivityItem } from '@/src/components/ui/activity-item'
import { EmptyState } from '@/src/components/ui/empty-state'
import { AppButton } from '@/src/components/ui/app-button'
import { AppInput } from '@/src/components/ui/app-input'
import { resolveUserId } from '@/src/utils/resolve-user-id'
import { formatDate, formatMoney } from '@/src/utils/format'

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const { user } = useAuth()
  const userId = resolveUserId(user as Record<string, unknown>)
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [group, setGroup] = useState<Group | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [balance, setBalance] = useState<GroupBalance | null>(null)
  const [profilesById, setProfilesById] = useState<Record<string, UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)

  const load = useCallback(async () => {
    if (!groupId || !userId) return
    setLoading(true)
    try {
      const allGroups = await getUserGroups(userId)
      const found = allGroups.find((g) => g._id === groupId)
      if (!found) { router.back(); return }
      setGroup(found)

      const ids = found.members.map((m) => m.userId)
      const profiles = await Promise.all(
        ids.map(async (id) => {
          try { return [id, await getPublicProfile(id)] }
          catch { return [id, { _id: id, name: 'Membro', email: '' } as UserProfile] }
        })
      )
      setProfilesById(Object.fromEntries(profiles))

      const [exps, acts, bal] = await Promise.all([
        getGroupExpenses(groupId, userId),
        getGroupActivities(groupId, userId),
        getGroupBalance(groupId, userId),
      ])
      setExpenses(exps)
      setActivities(acts)
      setBalance(bal)
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    } finally {
      setLoading(false)
    }
  }, [groupId, userId])

  useEffect(() => { load() }, [load])

  const members = useMemo(() => group?.members.map((m) => ({
    ...m,
    name: profilesById[m.userId]?.name ?? 'Membro',
    email: profilesById[m.userId]?.email ?? '',
  })) ?? [], [group, profilesById])

  const isCreator = group && group.createdBy === userId
  const hasPending = expenses.some((e) => e.splits.some((s) => s.status === 'pendente'))

  const myPending = useMemo(() =>
    expenses.filter((e) => e.splits.find((s) => s.userId === userId)?.status === 'pendente'),
    [expenses, userId]
  )

  const handleSettle = async (expenseId: string) => {
    try {
      await settleExpenseShare(expenseId, userId)
      await load()
      Alert.alert('✅', 'Pagamento registrado!')
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    }
  }

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    try {
      await inviteToGroup(groupId!, { email: inviteEmail.trim().toLowerCase(), addedBy: userId })
      setInviteEmail('')
      setShowInvite(false)
      await load()
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    } finally {
      setInviteLoading(false)
    }
  }

  const handleDelete = () => {
    if (!isCreator) return
    if (hasPending) {
      Alert.alert('Não é possível excluir', 'Quite todos os pagamentos pendentes antes de excluir o grupo.')
      return
    }
    Alert.alert('Excluir grupo?', 'Esta ação não pode ser desfeita.', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir', style: 'destructive',
        onPress: async () => {
          try {
            await deleteGroup(groupId!, userId)
            router.back()
          } catch (err) {
            Alert.alert('Erro', (err as Error).message)
          }
        },
      },
    ])
  }

  if (loading || !group) {
    return (
      <View style={[styles.center, { backgroundColor: c.canvas }]}>
        <Text style={[Typography.body, { color: c.textSecondary }]}>Carregando grupo...</Text>
      </View>
    )
  }

  const netTone = (balance?.netBalance ?? 0) > 0.01 ? 'positive' : (balance?.netBalance ?? 0) < -0.01 ? 'negative' : 'neutral'

  const sections = [
    { title: 'Saldo do grupo', data: ['balance'] as const },
    { title: `Despesas (${expenses.length})`, data: expenses.length ? expenses : ['empty-expenses'] },
    { title: `Membros (${members.length})`, data: members.length ? members : ['empty-members'] },
    { title: `Atividades (${activities.length})`, data: activities.length ? activities.slice(0, 10) : ['empty-activities'] },
    ...(myPending.length ? [{ title: 'Meus pagamentos pendentes', data: myPending }] : []),
  ]

  return (
    <View style={[styles.root, { backgroundColor: c.canvas }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.canvas, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.back()}>
          <Text style={[Typography.body, { color: c.accentDeep, fontWeight: '700' }]}>← Grupos</Text>
        </TouchableOpacity>
        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: c.accentBg }]} onPress={() => setShowInvite(true)}>
            <Text style={[Typography.caption, { color: c.accentDeep, fontWeight: '700' }]}>Convidar</Text>
          </TouchableOpacity>
          {isCreator ? (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(200,31,31,0.08)' }]} onPress={handleDelete}>
              <Text style={[Typography.caption, { color: '#c81f1f', fontWeight: '700' }]}>Excluir</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <Text style={[Typography.h1, { color: c.textPrimary, padding: Spacing.lg, paddingBottom: 0 }]}>
        {group.name}
      </Text>
      {group.description ? (
        <Text style={[Typography.body, { color: c.textSecondary, paddingHorizontal: Spacing.lg }]}>
          {group.description}
        </Text>
      ) : null}

      <SectionList
        sections={sections as any}
        keyExtractor={(item, i) => (typeof item === 'string' ? item : (item as any)._id ?? String(i))}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 80 }}
        renderSectionHeader={({ section }) => (
          <Text style={[Typography.h2, { color: c.textPrimary, marginBottom: Spacing.sm }]}>
            {section.title}
          </Text>
        )}
        renderItem={({ item, section }) => {
          // Balance
          if (section.title.includes('Saldo') && item === 'balance') {
            return (
              <View style={{ gap: Spacing.md }}>
                <View style={styles.statsRow}>
                  <StatCard label='Paguei' value={formatMoney(balance?.totalPaid ?? 0)} />
                  <StatCard label='Devo' value={formatMoney(balance?.totalOwed ?? 0)} tone={balance?.totalOwed ?? 0 > 0 ? 'negative' : 'neutral'} />
                </View>
                <StatCard label='Saldo líquido' value={formatMoney(balance?.netBalance ?? 0)} tone={netTone} />
              </View>
            )
          }

          // Empty states
          if (typeof item === 'string' && item.startsWith('empty-')) {
            const label = item === 'empty-expenses' ? '💸' : item === 'empty-members' ? '👥' : '📋'
            const msg = item === 'empty-expenses' ? 'Nenhuma despesa ainda.' : item === 'empty-members' ? 'Sem membros.' : 'Sem atividades.'
            return <EmptyState icon={label} message={msg} />
          }

          // Expense
          if ((item as Expense).splits) {
            const exp = item as Expense
            const mine = exp.splits.find((s) => s.userId === userId)
            return (
              <View style={[styles.expenseCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={styles.expenseHeader}>
                  <Text style={[Typography.h3, { color: c.textPrimary, flex: 1 }]}>{exp.description}</Text>
                  <Text style={[Typography.h3, { color: c.textPrimary }]}>{formatMoney(exp.amount)}</Text>
                </View>
                <Text style={[Typography.caption, { color: c.textSecondary }]}>
                  Pago por {profilesById[exp.paidBy]?.name ?? 'Membro'} · {formatDate(exp.createdAt)}
                </Text>
                <View style={styles.splits}>
                  {exp.splits.map((s) => (
                    <View key={s.userId} style={[styles.splitPill, { backgroundColor: s.status === 'pago' ? 'rgba(12,124,79,0.08)' : 'rgba(200,31,31,0.06)' }]}>
                      <Text style={[Typography.caption, { color: s.status === 'pago' ? '#0c7c4f' : '#c81f1f', fontWeight: '600' }]}>
                        {profilesById[s.userId]?.name ?? 'Membro'}: {formatMoney(s.amount)} {s.status === 'pago' ? '✓' : ''}
                      </Text>
                    </View>
                  ))}
                </View>
                {mine?.status === 'pendente' ? (
                  <AppButton
                    title={`Registrar pagamento (${formatMoney(mine.amount)})`}
                    onPress={() => handleSettle(exp._id)}
                    variant='outline'
                  />
                ) : null}
              </View>
            )
          }

          // Member
          if ((item as any).userId) {
            const m = item as { userId: string; role: string; name: string; email: string }
            return (
              <View style={[styles.memberItem, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View>
                  <Text style={[Typography.body, { color: c.textPrimary, fontWeight: '600' }]}>{m.name}</Text>
                  {m.email ? <Text style={[Typography.caption, { color: c.textSecondary }]}>{m.email}</Text> : null}
                </View>
                <View style={[styles.roleBadge, { backgroundColor: m.role === 'admin' ? c.accentBg : c.canvas }]}>
                  <Text style={[Typography.caption, { color: c.accentDeep, fontWeight: '700' }]}>
                    {m.role === 'admin' ? 'Admin' : 'Membro'}
                  </Text>
                </View>
              </View>
            )
          }

          // Activity
          if ((item as Activity).type) {
            return <ActivityItem activity={item as Activity} />
          }

          // Pending payment
          if ((item as Expense).paidBy) {
            const exp = item as Expense
            const mine = exp.splits.find((s) => s.userId === userId)
            return (
              <View style={[styles.pendingCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={{ flex: 1 }}>
                  <Text style={[Typography.h3, { color: c.textPrimary }]}>{exp.description}</Text>
                  <Text style={[Typography.caption, { color: c.textSecondary }]}>
                    {formatMoney(mine?.amount ?? 0)} · {formatDate(exp.createdAt)}
                  </Text>
                </View>
                <AppButton title='Pagar' onPress={() => handleSettle(exp._id)} variant='outline' />
              </View>
            )
          }

          return null
        }}
      />

      {/* Modal convite */}
      <Modal visible={showInvite} animationType='slide' presentationStyle='pageSheet' onRequestClose={() => setShowInvite(false)}>
        <View style={[styles.modal, { backgroundColor: c.canvas }]}>
          <View style={styles.modalHeader}>
            <Text style={[Typography.h1, { color: c.textPrimary }]}>Convidar membro</Text>
            <TouchableOpacity onPress={() => setShowInvite(false)}>
              <Text style={[Typography.body, { color: c.accent }]}>Fechar</Text>
            </TouchableOpacity>
          </View>
          <AppInput
            label='E-mail' placeholder='amigo@exemplo.com'
            value={inviteEmail} onChangeText={setInviteEmail}
            keyboardType='email-address' autoCapitalize='none'
          />
          <Text style={[Typography.caption, { color: c.textSecondary }]}>
            O usuário precisa já ter uma conta no RATE.IO.
          </Text>
          <AppButton title={inviteLoading ? 'Enviando...' : 'Convidar'} onPress={handleInvite} loading={inviteLoading} disabled={inviteLoading} />
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg, borderBottomWidth: 1 },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  expenseCard: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, gap: Spacing.sm, marginBottom: Spacing.sm },
  expenseHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  splits: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  splitPill: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  memberItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  roleBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  pendingCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
  modal: { flex: 1, padding: Spacing.lg, gap: Spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
})
```

---

## Issue 2.5 — Tela de Atividades

**Branch:** `feature/mobile-activities`

### `app/(app)/activities.tsx`

```tsx
// src/mobile/app/(app)/activities.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { getGroupActivities, getUserGroups, type Activity, type Group } from '@/src/features/groups/group-service'
import { ActivityItem } from '@/src/components/ui/activity-item'
import { EmptyState } from '@/src/components/ui/empty-state'
import { resolveUserId } from '@/src/utils/resolve-user-id'

const TYPES = [
  { key: 'all', label: 'Todos' },
  { key: 'EXPENSE_CREATED', label: 'Despesas' },
  { key: 'PAYMENT_SETTLED', label: 'Pagamentos' },
  { key: 'MEMBER_ADDED', label: 'Membros' },
]

export default function ActivitiesScreen() {
  const { user } = useAuth()
  const userId = resolveUserId(user as Record<string, unknown>)
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [groups, setGroups] = useState<Group[]>([])
  const [activitiesMap, setActivitiesMap] = useState<Record<string, Activity[]>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const load = useCallback(async () => {
    if (!userId) return
    try {
      const gs = await getUserGroups(userId)
      setGroups(gs)
      const entries = await Promise.all(
        gs.map(async (g) => {
          try { return [g._id, await getGroupActivities(g._id, userId)] }
          catch { return [g._id, [] as Activity[]] }
        })
      )
      setActivitiesMap(Object.fromEntries(entries))
    } catch { /* silencioso */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [userId])

  useEffect(() => { load() }, [load])

  const allActivities = useMemo(() => {
    const list: (Activity & { groupName: string })[] = []
    for (const [gId, acts] of Object.entries(activitiesMap)) {
      const gName = groups.find((g) => g._id === gId)?.name ?? 'Grupo'
      for (const a of acts) list.push({ ...a, groupName: gName })
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [activitiesMap, groups])

  const filtered = filterType === 'all' ? allActivities : allActivities.filter((a) => a.type === filterType)

  return (
    <View style={[styles.root, { backgroundColor: c.canvas }]}>
      <Text style={[Typography.h1, { color: c.textPrimary, padding: Spacing.lg, paddingBottom: Spacing.sm }]}>
        Atividades
      </Text>

      {/* Filtros */}
      <View style={styles.filters}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.chip, { backgroundColor: filterType === t.key ? c.accentDeep : c.surface, borderColor: c.border }]}
            onPress={() => setFilterType(t.key)}
          >
            <Text style={[Typography.caption, { color: filterType === t.key ? '#fff' : c.textSecondary, fontWeight: '700' }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} />}
        ListEmptyComponent={
          loading ? (
            <Text style={[Typography.body, { color: c.textSecondary, textAlign: 'center', paddingTop: 40 }]}>
              Carregando atividades...
            </Text>
          ) : (
            <EmptyState icon='📋' message='Nenhuma atividade ainda.' />
          )
        }
        renderItem={({ item }) => <ActivityItem activity={item} groupName={item.groupName} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filters: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, flexWrap: 'wrap', marginBottom: Spacing.sm },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
})
```

---

# Milestone 3 — Sprint 3: Perfil, Despesas, Testes e Entrega
**25/05 a 31/05/2026**

---

## Issue 3.1 — Tela de Perfil

**Branch:** `feature/mobile-profile`

### `app/(app)/profile.tsx`

```tsx
// src/mobile/app/(app)/profile.tsx
import { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { updateProfile } from '@/src/features/auth/user-service'
import { changePassword } from '@/src/features/auth/auth-service'
import { AppButton } from '@/src/components/ui/app-button'
import { AppInput } from '@/src/components/ui/app-input'
import { resolveUserId } from '@/src/utils/resolve-user-id'

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth()
  const userId = resolveUserId(user as Record<string, unknown>)
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [name, setName] = useState(user?.name ?? '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const handleUpdateProfile = async () => {
    if (!name.trim()) { Alert.alert('Erro', 'Nome obrigatório'); return }
    setProfileLoading(true)
    try {
      await updateProfile({ name: name.trim() })
      await refreshUser()
      Alert.alert('✅', 'Perfil atualizado!')
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos.'); return
    }
    if (newPassword.length < 6) {
      Alert.alert('Erro', 'Nova senha deve ter no mínimo 6 caracteres.'); return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'Senhas não conferem.'); return
    }
    setPwLoading(true)
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      Alert.alert('✅', 'Senha alterada com sucesso!')
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <ScrollView style={{ backgroundColor: c.canvas }} contentContainerStyle={styles.content}>
      <Text style={[Typography.h1, { color: c.textPrimary }]}>Perfil</Text>

      {/* Dados da conta */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[Typography.h2, { color: c.textPrimary }]}>Dados da conta</Text>
        <Text style={[Typography.caption, { color: c.textSecondary }]}>E-mail: {user?.email}</Text>
        <Text style={[Typography.caption, { color: c.textSecondary }]}>ID: {userId}</Text>
        <AppInput label='Nome' value={name} onChangeText={setName} placeholder='Seu nome' />
        <AppButton title={profileLoading ? 'Salvando...' : 'Salvar nome'} onPress={handleUpdateProfile} loading={profileLoading} disabled={profileLoading} />
      </View>

      {/* Trocar senha */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[Typography.h2, { color: c.textPrimary }]}>Trocar senha</Text>
        <AppInput label='Senha atual' value={currentPassword} onChangeText={setCurrentPassword} secureTextEntry placeholder='••••••••' />
        <AppInput label='Nova senha' value={newPassword} onChangeText={setNewPassword} secureTextEntry placeholder='Mínimo 6 caracteres' />
        <AppInput label='Confirmar nova senha' value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry placeholder='••••••••' />
        <AppButton title={pwLoading ? 'Alterando...' : 'Alterar senha'} onPress={handleChangePassword} loading={pwLoading} disabled={pwLoading} variant='outline' />
      </View>

      {/* Logout */}
      <AppButton title='Sair da conta' onPress={logout} variant='danger' />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 80 },
  card: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
})
```

---

## Issue 3.2 — Testes unitários dos services

**Branch:** `feature/mobile-tests`

### `__tests__/auth-service.test.ts`

```ts
// src/mobile/__tests__/auth-service.test.ts
import { login, register } from '../src/features/auth/auth-service'

jest.mock('../src/services/api-client', () => ({
  request: jest.fn(),
}))

const { request } = require('../src/services/api-client')

describe('auth-service', () => {
  beforeEach(() => jest.clearAllMocks())

  it('login chama POST /api/auth/login com payload correto', async () => {
    request.mockResolvedValueOnce({ token: 'abc', userId: '123', message: 'ok' })
    const result = await login({ email: 'a@b.com', password: '123456' })
    expect(request).toHaveBeenCalledWith('/api/auth/login', expect.objectContaining({ method: 'POST' }))
    expect(result.token).toBe('abc')
  })

  it('register chama POST /api/auth/register com nome, email e senha', async () => {
    request.mockResolvedValueOnce({ message: 'criado', authId: 'x', id: 'y', name: 'João', email: 'a@b.com' })
    await register({ name: 'João', email: 'a@b.com', password: '123456' })
    expect(request).toHaveBeenCalledWith('/api/auth/register', expect.objectContaining({
      body: expect.stringContaining('João'),
    }))
  })
})
```

### `__tests__/group-service.test.ts`

```ts
// src/mobile/__tests__/group-service.test.ts
import { getUserGroups, createGroup } from '../src/features/groups/group-service'

jest.mock('../src/services/api-client', () => ({ request: jest.fn() }))
const { request } = require('../src/services/api-client')

describe('group-service', () => {
  beforeEach(() => jest.clearAllMocks())

  it('getUserGroups chama rota correta com userId', async () => {
    request.mockResolvedValueOnce([])
    await getUserGroups('user123')
    expect(request).toHaveBeenCalledWith('/api/groups/user/user123')
  })

  it('createGroup envia createdBy no body', async () => {
    request.mockResolvedValueOnce({ _id: 'g1', name: 'Grupo', members: [] })
    await createGroup({ name: 'Grupo', createdBy: 'user123' })
    expect(request).toHaveBeenCalledWith('/api/groups', expect.objectContaining({
      body: expect.stringContaining('user123'),
    }))
  })
})
```

---

## Issue 3.3 — Checklist de entrega e deploy

**Branch:** `docs/mobile-delivery`

### Passo 1 — Rodar e verificar

```bash
cd src/mobile

# Lint
npm run lint

# Testes
npm test

# Iniciar o app
npm run start
```

### Passo 2 — Testar no dispositivo físico

```bash
# Atualizar .env com o IP local da máquina
EXPO_PUBLIC_API_BASE_URL=http://192.168.X.X:3000

# Iniciar o backend
cd src/backend && npm run dev

# Em outro terminal, iniciar o mobile
cd src/mobile && npm run start
# Escanear QR Code com o Expo Go no celular
```

### Passo 3 — Build de homologação com EAS (opcional)

```bash
npm install -g eas-cli
eas login
eas build:configure

# Criar eas.json
cat > eas.json << 'EOF'
{
  "cli": { "version": ">= 7.0.0" },
  "build": {
    "preview": {
      "distribution": "internal",
      "android": { "buildType": "apk" },
      "env": { "EXPO_PUBLIC_API_BASE_URL": "https://sua-api.onrender.com" }
    }
  }
}
EOF

eas build --platform android --profile preview
```

---

## Checklist final de conclusão

### Sprint 1
- [ ] Estrutura de pastas criada conforme o diagrama
- [ ] `constants/theme.ts` atualizado com paleta do design system
- [ ] `src/services/api-client.ts` implementado com tratamento de 401
- [ ] `src/services/storage.ts` usando `expo-secure-store`
- [ ] `src/features/auth/auth-context.tsx` com bootstrap, login, register, logout
- [ ] `app/_layout.tsx` com `AuthProvider` e `AuthGate`
- [ ] `app/(auth)/login.tsx` integrado ao backend
- [ ] `app/(auth)/register.tsx` com auto-login após cadastro
- [ ] Componentes UI base criados (`AppButton`, `AppInput`, `StatCard`, `EmptyState`, `ActivityItem`)
- [ ] `npm test` passa nos testes do `api-client`
- [ ] Bootstrap não pisca tela de login quando há sessão válida

### Sprint 2
- [ ] `src/features/groups/group-service.ts` implementado
- [ ] `src/features/expenses/expense-service.ts` implementado (com extração de envelopes)
- [ ] `app/(app)/index.tsx` (Dashboard) com 4 stat cards e pendências reais
- [ ] `app/(app)/groups/index.tsx` com lista, busca e modal de criação
- [ ] `app/(app)/groups/[groupId].tsx` com saldo, despesas, membros, atividades e convite
- [ ] `app/(app)/activities.tsx` com feed global e filtros
- [ ] `status === 'pendente'` em todos os filtros (nunca `'owed'`)
- [ ] Sem cálculo financeiro no mobile — tudo vem da API

### Sprint 3
- [ ] `app/(app)/profile.tsx` com edição de nome e troca de senha
- [ ] `npm test` passa em `auth-service.test.ts` e `group-service.test.ts`
- [ ] `npm run lint` sem erros
- [ ] App testado no dispositivo físico ou emulador com backend real
- [ ] Evidências de testes documentadas (`docs/09-Registro de Testes de Integração.md`)
- [ ] Prints das telas salvas em `docs/img/mobile/`
- [ ] Vídeo de apresentação gravado (máx. 6 min)

---

## Definition of Done (por issue)

Uma issue está **concluída** quando:
1. Código segue TypeScript e Expo Router file-based routing
2. HTTP centralizado em `api-client.ts` — nenhuma tela usa `fetch` diretamente
3. Token manipulado somente em `storage.ts`
4. `user._id` vem de `GET /api/users/profile` (nunca do login)
5. Envelopes extraídos: `res.expenses`, `res.balance`
6. `status === 'pendente'` (português)
7. Toda tela trata loading, erro e estado vazio
8. Ações destrutivas pedem confirmação via `Alert.alert`
9. PR referencia o milestone e a issue
10. Print ou evidência salva em `docs/img/mobile/`

---

*Playbook gerado em Maio/2026 — RATE.IO Mobile v2.0*
*Reformulado com base na análise do código real: Expo SDK 54, Expo Router v6, TypeScript.*
