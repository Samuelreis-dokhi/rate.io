// src/mobile/app/(auth)/login.tsx
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { AppButton } from '@/components/ui/app-button'
import { AppInput } from '@/components/ui/app-input'

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
          <Link href={'register' as any}>
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