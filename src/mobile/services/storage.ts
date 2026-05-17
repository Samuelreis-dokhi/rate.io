// este arquivo é responsável por armazenar o token de autenticação e o perfil do usuário usando o SecureStore do Expo,
// que é uma alternativa segura ao AsyncStorage para dados sensíveis em aplicativos React Native/Expo.

import * as SecureStore from 'expo-secure-store';

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