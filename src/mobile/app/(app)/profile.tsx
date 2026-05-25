// src/mobile/app/(app)/profile.tsx
import { useState } from 'react'
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { updateProfile } from '@/src/features/auth/user-service'
import { changePassword } from '@/src/features/auth/auth-service'
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
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [pwLoading, setPwLoading] = useState(false)

  const handleUpdateProfile = async () => {
    if (!name.trim()) { Alert.alert('Erro', 'Nome obrigatório'); return }
    setProfileLoading(true)
    try {
      await updateProfile({ name: name.trim() })
      await refreshUser()
      Alert.alert('✅', 'Perfil atualizado!')
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    } finally {
      setProfileLoading(false)
    }
  }

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Erro', 'Preencha todos os campos.'); return
    }
    if (newPassword.length < 6) {
      Alert.alert('Erro', 'Nova senha deve ter no mínimo 6 caracteres.'); return
    }
    if (newPassword !== confirmPassword) {
      Alert.alert('Erro', 'Senhas não conferem.'); return
    }
    setPwLoading(true)
    try {
      await changePassword({ currentPassword, newPassword, confirmPassword })
      setCurrentPassword(''); setNewPassword(''); setConfirmPassword('')
      Alert.alert('✅', 'Senha alterada com sucesso!')
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
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
        <Text style={[Typography.caption, { color: c.textSecondary }]}>E-mail: {user?.email}</Text>
        <Text style={[Typography.caption, { color: c.textSecondary }]}>ID: {userId}</Text>
        <AppInput label='Nome' value={name} onChangeText={setName} placeholder='Seu nome' />
        <AppButton title={profileLoading ? 'Salvando...' : 'Salvar nome'} onPress={handleUpdateProfile} loading={profileLoading} disabled={profileLoading} />
      </View>

      {/* Trocar senha */}
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
        <Text style={[Typography.h2, { color: c.textPrimary }]}>Trocar senha</Text>
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
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: 80 },
  card: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.md },
})