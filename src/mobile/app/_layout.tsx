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

    const inAuthGroup = (segments[0] as any) === '(auth)'

    if (!isAuthenticated && !inAuthGroup) {
      router.replace('/(auth)/login' as any)
    } else if (isAuthenticated && inAuthGroup) {
      router.replace('/(app)' as any)
    }
  }, [isAuthenticated, bootstrapping, segments, router])

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