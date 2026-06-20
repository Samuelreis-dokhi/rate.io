import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';

import { clearSession, getProfile, getToken, saveProfile, saveToken } from '../../../services/storage';
import * as authService from './auth-service';
import { getCurrentUser, type UserProfile } from './user-service';

interface AuthContextValue {
  user: UserProfile | null;
  bootstrapping: boolean;
  isAuthenticated: boolean;
  login(payload: { email: string; password: string }): Promise<void>;
  register(payload: { name: string; email: string; password: string }): Promise<void>;
  logout(): Promise<void>;
  refreshUser(): Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [bootstrapping, setBootstrapping] = useState(true);

  useEffect(() => {
    let mounted = true

    async function bootstrap() {
      try {
        const token = await getToken()

        if (!token) {
          if (mounted) setUser(null)
          return
        }

        const cached = await getProfile<UserProfile>()
        if (cached && mounted) {
          setUser(cached)
        }

        const fresh = await getCurrentUser()
        await saveProfile(fresh)

        if (mounted) {
          setUser(fresh)
        }
      } catch {
        await clearSession()
        if (mounted) {
          setUser(null)
        }
      } finally {
        if (mounted) {
          setBootstrapping(false)
        }
      }
    }

    bootstrap()

    return () => {
      mounted = false
    }
  }, [])

  const login = useCallback(async (payload: { email: string; password: string }) => {
    const authData = await authService.login(payload)
    await saveToken(authData.token)

    const profile = await getCurrentUser()
    await saveProfile(profile)
    setUser(profile)
  }, [])

  const register = useCallback(
    async (payload: { name: string; email: string; password: string }) => {
      await authService.register(payload)
      await login({ email: payload.email, password: payload.password })
    },
    [login]
  )

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
    [user, bootstrapping, login, register, logout, refreshUser]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de um AuthProvider')
  return ctx
}
