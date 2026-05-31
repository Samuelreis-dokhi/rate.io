// This file stores the authentication token and user profile.
// On mobile, we use Expo SecureStore for sensitive data.
// On web, expo-secure-store has no native implementation, so we use localStorage.

import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'rateio.token'
const PROFILE_KEY = 'rateio.profile'

const memoryStorage = new Map<string, string>()

function getWebStorage(): Storage | null {
  if (typeof window === 'undefined' || !window.localStorage) return null
  return window.localStorage
}

async function setStorageItem(key: string, value: string): Promise<void> {
  if (Platform.OS === 'web') {
    const storage = getWebStorage()

    if (storage) {
      storage.setItem(key, value)
      return
    }

    memoryStorage.set(key, value)
    return
  }

  await SecureStore.setItemAsync(key, value)
}

async function getStorageItem(key: string): Promise<string | null> {
  if (Platform.OS === 'web') {
    const storage = getWebStorage()
    return storage ? storage.getItem(key) : memoryStorage.get(key) ?? null
  }

  return SecureStore.getItemAsync(key)
}

async function deleteStorageItem(key: string): Promise<void> {
  if (Platform.OS === 'web') {
    const storage = getWebStorage()

    if (storage) {
      storage.removeItem(key)
      return
    }

    memoryStorage.delete(key)
    return
  }

  await SecureStore.deleteItemAsync(key)
}

export async function saveToken(token: string): Promise<void> {
  await setStorageItem(TOKEN_KEY, token)
}

export async function getToken(): Promise<string | null> {
  return getStorageItem(TOKEN_KEY)
}

export async function saveProfile(profile: object): Promise<void> {
  await setStorageItem(PROFILE_KEY, JSON.stringify(profile))
}

export async function getProfile<T = object>(): Promise<T | null> {
  const value = await getStorageItem(PROFILE_KEY)
  return value ? JSON.parse(value) : null
}

export async function clearSession(): Promise<void> {
  await deleteStorageItem(TOKEN_KEY)
  await deleteStorageItem(PROFILE_KEY)
}
