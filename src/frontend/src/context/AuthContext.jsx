// src/context/AuthContext.jsx
import { useEffect, useMemo, useState } from 'react'
import { api } from '../services/api'
import { AuthContext } from './auth-context'

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [user, setUser] = useState(null)
  const [bootstrapping, setBootstrapping] = useState(true)

  // Executa uma vez ao montar (ou quando o token muda).
  // Valida o token existente buscando o perfil do usuário.
  useEffect(() => {
    const bootstrap = async () => {
      if (!token) {
        setBootstrapping(false)
        return
      }

      try {
        // GET /api/users/profile — usa o token para identificar o usuário
        const currentUser = await api.getCurrentUser()
        setUser(currentUser)
      } catch {
        // Token inválido ou expirado — limpar tudo
        localStorage.removeItem('token')
        localStorage.removeItem('authId')
        setToken(null)
        setUser(null)
      } finally {
        setBootstrapping(false)
      }
    }

    bootstrap()
  }, [token])

  const login = async ({ email, password }) => {
    // POST /api/auth/login → { message, token, userId }
    const authData = await api.login({ email, password })

    // Backend retorna 'userId' no login — guardar como 'authId' para referência futura
    const authId = authData.authId || authData.userId
    localStorage.setItem('token', authData.token)
    localStorage.setItem('authId', authId)
    setToken(authData.token)

    // Buscar o perfil completo após login (nome, email, _id do User)
    // GET /api/users/profile → User document
    const currentUser = await api.getCurrentUser()
    setUser(currentUser)
    return currentUser
  }

  const register = async ({ name, email, password }) => {
    // POST /api/auth/register → { message, authId, id, name, email }
    // Não faz login automático — usuário precisa fazer login após registro
    return await api.register({ name, email, password })
  }

  const logout = async () => {
    try {
      await api.logout()  // Promise.resolve() — não faz requisição
    } finally {
      localStorage.removeItem('token')
      localStorage.removeItem('authId')
      setToken(null)
      setUser(null)
    }
  }

  // useMemo garante que o objeto de contexto só é recriado quando
  // token, user ou bootstrapping mudam — evita re-renders desnecessários
  const value = useMemo(
    () => ({
      token,
      user,
      isAuthenticated: Boolean(token && user),
      bootstrapping,
      login,
      register,
      logout,
    }),
    [token, user, bootstrapping],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
