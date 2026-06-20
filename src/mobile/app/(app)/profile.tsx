// src/mobile/app/(app)/profile.tsx
import { useEffect, useRef, useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Layout, Radius, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { updateProfile } from '@/src/features/auth/user-service'
import { changePassword } from '@/src/features/auth/auth-service'
import { ApiError } from '@/services/api-client'
import { AppButton } from '@/components/ui/app-button'
import { AppInput } from '@/components/ui/app-input'
import { resolveUserId } from '@/src/utils/resolve-user-id'

export default function ProfileScreen() {
  const { user, logout, refreshUser } = useAuth()
  const userId = resolveUserId(user)
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [name, setName] = useState(user?.name ?? '')
  const [profileLoading, setProfileLoading] = useState(false)
  const [profileSuccess, setProfileSuccess] = useState('')
  const profileSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)
  const [passwordNotice, setPasswordNotice] = useState<{ message: string; kind: 'success' | 'error' } | null>(null)
  const passwordNoticeTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => () => {
    if (profileSuccessTimerRef.current) clearTimeout(profileSuccessTimerRef.current)
    if (passwordNoticeTimerRef.current) clearTimeout(passwordNoticeTimerRef.current)
  }, [])

  const handleUpdateProfile = async () => {
    if (!name.trim()) { Alert.alert('Erro', 'Nome obrigatório'); return }
    setProfileSuccess('')
    setProfileLoading(true)
    try {
      await updateProfile({ name: name.trim() })
      await refreshUser()
      setProfileSuccess('Nome de usuário alterado com sucesso')
      if (profileSuccessTimerRef.current) clearTimeout(profileSuccessTimerRef.current)
      profileSuccessTimerRef.current = setTimeout(() => setProfileSuccess(''), 3500)
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    } finally {
      setProfileLoading(false)
    }
  }

  const showPasswordNotice = (message: string, kind: 'success' | 'error') => {
    setPasswordNotice({ message, kind })
    if (passwordNoticeTimerRef.current) clearTimeout(passwordNoticeTimerRef.current)
    if (kind === 'success') {
      passwordNoticeTimerRef.current = setTimeout(() => setPasswordNotice(null), 3500)
    }
  }

  const getPasswordApiErrorMessage = (err: unknown) => {
    const apiErrorMessage = err instanceof ApiError
      ? (err.data as { error?: string })?.error ?? err.message
      : (err as Error).message

    if (apiErrorMessage === 'Senha atual incorreta') {
      return 'Senha atual incorreta. Verifique e tente novamente.'
    }

    if (apiErrorMessage === 'a senha nao pode ser a mesma utilizada anteriormente') {
      return 'A nova senha deve ser diferente da senha atual.'
    }

    return apiErrorMessage || 'Não foi possível alterar a senha. Tente novamente.'
  }

  const handleChangePassword = async () => {
    setPasswordNotice(null)

    if (!currentPassword || !newPassword || !confirmPassword) {
      showPasswordNotice('Preencha todos os campos para alterar a senha.', 'error')
      return
    }

    if (newPassword.length < 6) {
      showPasswordNotice('A nova senha deve ter no mínimo 6 caracteres.', 'error')
      return
    }

    if (newPassword !== confirmPassword) {
      showPasswordNotice('As senhas não combinam. Confira a nova senha e a confirmação.', 'error')
      return
    }

    setPwLoading(true)
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      showPasswordNotice('Senha alterada com sucesso!', 'success')
    } catch (err) {
      showPasswordNotice(getPasswordApiErrorMessage(err), 'error')
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
        {profileSuccess ? (
          <View
            accessibilityLiveRegion='polite'
            style={[styles.notice, { backgroundColor: c.positive + '14', borderColor: c.positive + '55' }]}
          >
            <Text style={[Typography.body, styles.noticeText, { color: c.positive }]}>
              {profileSuccess}
            </Text>
          </View>
        ) : null}
        <Text style={[Typography.caption, { color: c.textSecondary }]}>E-mail: {user?.email}</Text>
        <Text style={[Typography.caption, { color: c.textSecondary }]}>ID: {userId}</Text>
        <AppInput label='Nome' value={name} onChangeText={setName} placeholder='Seu nome' />
        <AppButton title={profileLoading ? 'Salvando...' : 'Salvar nome'} onPress={handleUpdateProfile} loading={profileLoading} disabled={profileLoading} />
      </View>

      {/* Trocar senha */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[Typography.h2, { color: c.textPrimary }]}>Trocar senha</Text>
        {passwordNotice ? (
          <View
            accessibilityLiveRegion='polite'
            style={[
              styles.notice,
              passwordNotice.kind === 'success'
                ? { backgroundColor: c.positive + '14', borderColor: c.positive + '55' }
                : { backgroundColor: c.negative + '14', borderColor: c.negative + '55' },
            ]}
          >
            <Text
              style={[
                Typography.body,
                styles.noticeText,
                { color: passwordNotice.kind === 'success' ? c.positive : c.negative },
              ]}
            >
              {passwordNotice.message}
            </Text>
          </View>
        ) : null}
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
  content: { padding: Layout.screenPadding, gap: Spacing.lg, paddingBottom: Layout.screenBottomPadding },
  card: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
  notice: {
    borderRadius: Radius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
  },
  noticeText: {
    fontWeight: '600',
  },
})
