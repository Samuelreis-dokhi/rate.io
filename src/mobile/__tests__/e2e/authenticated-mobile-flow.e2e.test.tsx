import React, { useEffect } from 'react'
import { Text } from 'react-native'
import { fireEvent, render, waitFor } from '@testing-library/react-native'
import { AuthProvider, useAuth } from '../../src/features/auth/auth-context'
import LoginScreen from '../../app/(auth)/login'
import DashboardScreen from '../../app/(app)/index'
import * as authService from '../../src/features/auth/auth-service'
import * as userService from '../../src/features/auth/user-service'
import * as groupService from '../../src/features/groups/group-service'
import * as expenseService from '../../src/features/expenses/expense-service'
import * as storage from '../../services/storage'

jest.mock('expo-router', () => {
  const React = require('react')
  const { Text } = require('react-native')

  return {
    Link: ({ children }: { children: React.ReactNode }) => <Text>{children}</Text>,
    router: {
      push: jest.fn(),
      replace: jest.fn(),
    },
    useFocusEffect: (callback: () => void | (() => void)) => {
      React.useEffect(() => callback(), [callback])
    },
  }
})

jest.mock('../../src/features/auth/auth-service', () => ({
  login: jest.fn(),
  register: jest.fn(),
}))

jest.mock('../../src/features/auth/user-service', () => ({
  getCurrentUser: jest.fn(),
  getPublicProfile: jest.fn(),
}))

jest.mock('../../src/features/groups/group-service', () => ({
  getUserGroups: jest.fn(),
}))

jest.mock('../../src/features/expenses/expense-service', () => ({
  getGroupExpenses: jest.fn(),
}))

jest.mock('../../services/storage', () => ({
  clearSession: jest.fn(),
  getProfile: jest.fn(),
  getToken: jest.fn(),
  saveProfile: jest.fn(),
  saveToken: jest.fn(),
}))

jest.mock('../../components/ui/icon-symbol', () => {
  const React = require('react')
  const { Text } = require('react-native')

  return {
    IconSymbol: () => <Text>icon</Text>,
  }
})

const profile = {
  _id: 'user-1',
  name: 'Ana Mobile',
  email: 'ana@teste.com',
  authId: 'auth-1',
  isActive: true,
}

function MobileFlow() {
  const { bootstrapping, isAuthenticated } = useAuth()

  if (bootstrapping) return <Text>Inicializando</Text>
  return isAuthenticated ? <DashboardScreen /> : <LoginScreen />
}

describe('E2E mobile: fluxo autenticado', () => {
  beforeEach(() => {
    jest.clearAllMocks()

    ;(authService.login as jest.Mock).mockResolvedValue({ token: 'token-mobile', userId: 'auth-1' })
    ;(userService.getCurrentUser as jest.Mock).mockResolvedValue(profile)
    ;(userService.getPublicProfile as jest.Mock).mockImplementation((userId: string) =>
      Promise.resolve({ _id: userId, name: userId === 'user-1' ? 'Ana Mobile' : 'Bruno Mobile' }),
    )
    ;(groupService.getUserGroups as jest.Mock).mockResolvedValue([
      {
        _id: 'group-1',
        name: 'Viagem Mobile',
        isActive: true,
        members: [{ userId: 'user-1' }, { userId: 'user-2' }],
      },
    ])
    ;(expenseService.getGroupExpenses as jest.Mock).mockResolvedValue([
      {
        _id: 'expense-1',
        description: 'Hospedagem Mobile',
        paidBy: 'user-2',
        splits: [{ userId: 'user-1', amount: 75, status: 'pendente' }],
      },
    ])
    ;(storage.clearSession as jest.Mock).mockResolvedValue(undefined)
    ;(storage.saveToken as jest.Mock).mockResolvedValue(undefined)
    ;(storage.saveProfile as jest.Mock).mockResolvedValue(undefined)
  })

  it('faz login pela tela mobile e exibe dashboard com dados financeiros', async () => {
    const screen = render(
      <AuthProvider>
        <MobileFlow />
      </AuthProvider>,
    )

    await waitFor(() => expect(screen.getByText('Bem-vindo de volta')).toBeTruthy())

    fireEvent.changeText(screen.getByPlaceholderText('voce@exemplo.com'), 'ANA@TESTE.COM')
    fireEvent.changeText(screen.getByPlaceholderText('••••••••'), 'senha123')
    fireEvent.press(screen.getByText('Entrar'))

    await waitFor(() => expect(screen.getByText('Olá, Ana Mobile!')).toBeTruthy())

    expect(authService.login).toHaveBeenCalledWith({
      email: 'ana@teste.com',
      password: 'senha123',
    })
    expect(storage.saveToken).toHaveBeenCalledWith('token-mobile')
    expect(groupService.getUserGroups).toHaveBeenCalledWith('user-1')
    expect(expenseService.getGroupExpenses).toHaveBeenCalledWith('group-1', 'user-1')
    expect(screen.getByText('Hospedagem Mobile')).toBeTruthy()
    expect(screen.getByText('Viagem Mobile · Para Bruno Mobile')).toBeTruthy()
  })
})
