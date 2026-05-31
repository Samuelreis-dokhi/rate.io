// src/mobile/app/(auth)/register.tsx
import { useState } from 'react'
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native'
import { Link } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { AppButton } from '@/components/ui/app-button'
import { AppInput } from '@/components/ui/app-input'

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
          <Link href={'login' as any}>
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