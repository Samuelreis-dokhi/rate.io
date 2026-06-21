import React from 'react'
import { Pressable, Text, View } from 'react-native'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { AuthProvider, useAuth } from '../../src/features/auth/auth-context'
import * as authService from '../../src/features/auth/auth-service'
import * as userService from '../../src/features/auth/user-service'
import * as storage from '../../services/storage'

jest.mock('../../src/features/auth/auth-service', () => ({
  login: jest.fn(),
  register: jest.fn(),
}))

jest.mock('../../src/features/auth/user-service', () => ({
  getCurrentUser: jest.fn(),
}))

jest.mock('../../services/storage', () => ({
  clearSession: jest.fn(),
  getProfile: jest.fn(),
  getToken: jest.fn(),
  saveProfile: jest.fn(),
  saveToken: jest.fn(),
}))

const profile = {
  _id: 'user-1',
  name: 'Ana',
  email: 'ana@teste.com',
  authId: 'auth-1',
  isActive: true,
}

function Consumer() {
  const { bootstrapping, isAuthenticated, login, logout, refreshUser, register, user } = useAuth()

  return (
    <View>
      <Text testID="bootstrapping">{String(bootstrapping)}</Text>
      <Text testID="authenticated">{String(isAuthenticated)}</Text>
      <Text testID="user-name">{user?.name ?? 'sem usuario'}</Text>
      <Pressable testID="login" onPress={() => login({ email: 'ANA@TESTE.COM', password: 'senha123' })}>
        <Text>login</Text>
      </Pressable>
      <Pressable testID="register" onPress={() => register({ name: 'Ana', email: 'ana@teste.com', password: 'senha123' })}>
        <Text>register</Text>
      </Pressable>
      <Pressable testID="refresh" onPress={refreshUser}>
        <Text>refresh</Text>
      </Pressable>
      <Pressable testID="logout" onPress={logout}>
        <Text>logout</Text>
      </Pressable>
    </View>
  )
}

describe('mobile integration: AuthProvider', () => {
  const mockedLogin = authService.login as jest.Mock
  const mockedRegister = authService.register as jest.Mock
  const mockedGetCurrentUser = userService.getCurrentUser as jest.Mock
  const mockedClearSession = storage.clearSession as jest.Mock
  const mockedSaveToken = storage.saveToken as jest.Mock
  const mockedSaveProfile = storage.saveProfile as jest.Mock

  beforeEach(() => {
    jest.clearAllMocks()
    mockedLogin.mockResolvedValue({ token: 'token-mobile', userId: 'auth-1' })
    mockedRegister.mockResolvedValue({ id: 'user-1' })
    mockedGetCurrentUser.mockResolvedValue(profile)
    mockedClearSession.mockResolvedValue(undefined)
    mockedSaveToken.mockResolvedValue(undefined)
    mockedSaveProfile.mockResolvedValue(undefined)
  })

  it('faz bootstrap de desenvolvimento, login, persiste sessao e logout', async () => {
    const screen = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    await waitFor(() => {
      expect(screen.getByTestId('bootstrapping')).toHaveTextContent('false')
    })

expect(mockedClearSession).not.toHaveBeenCalled()

    fireEvent.press(screen.getByTestId('login'))

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
      expect(screen.getByTestId('user-name')).toHaveTextContent('Ana')
    })

    expect(mockedLogin).toHaveBeenCalledWith({ email: 'ANA@TESTE.COM', password: 'senha123' })
    expect(mockedSaveToken).toHaveBeenCalledWith('token-mobile')
    expect(mockedGetCurrentUser).toHaveBeenCalledTimes(1)
    expect(mockedSaveProfile).toHaveBeenCalledWith(profile)

    fireEvent.press(screen.getByTestId('logout'))

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('false')
      expect(screen.getByTestId('user-name')).toHaveTextContent('sem usuario')
      expect(mockedClearSession).toHaveBeenCalledTimes(1)
    })
  })

  it('cadastro chama register e reutiliza fluxo de login automatico', async () => {
    const screen = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('bootstrapping')).toHaveTextContent('false'))

    fireEvent.press(screen.getByTestId('register'))

    await waitFor(() => {
      expect(screen.getByTestId('authenticated')).toHaveTextContent('true')
    })

    expect(mockedRegister).toHaveBeenCalledWith({
      name: 'Ana',
      email: 'ana@teste.com',
      password: 'senha123',
    })
    expect(mockedLogin).toHaveBeenCalledWith({ email: 'ana@teste.com', password: 'senha123' })
    expect(mockedSaveToken).toHaveBeenCalledWith('token-mobile')
    expect(mockedSaveProfile).toHaveBeenCalledWith(profile)
  })

  it('refreshUser atualiza perfil autenticado no contexto e no storage', async () => {
    const updatedProfile = { ...profile, name: 'Ana Atualizada' }
    mockedGetCurrentUser.mockResolvedValueOnce(profile).mockResolvedValueOnce(updatedProfile)

    const screen = render(
      <AuthProvider>
        <Consumer />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByTestId('bootstrapping')).toHaveTextContent('false'))
    fireEvent.press(screen.getByTestId('login'))
    await waitFor(() => expect(screen.getByTestId('user-name')).toHaveTextContent('Ana'))

    fireEvent.press(screen.getByTestId('refresh'))

    await waitFor(() => {
      expect(screen.getByTestId('user-name')).toHaveTextContent('Ana Atualizada')
      expect(mockedSaveProfile).toHaveBeenLastCalledWith(updatedProfile)
    })
  })
})
