import { StyleSheet, Text, View } from 'react-native'
import { useAuth } from '@/src/features/auth/auth-context'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Spacing, Typography } from '@/constants/theme'

export default function DashboardScreen() {
  const { user } = useAuth()
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  return (
    <View style={[styles.root, { backgroundColor: c.canvas }]}> 
      <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}> 
        <Text style={[Typography.display, { color: c.accentDeep }]}>Você está logado</Text>
        <Text style={[Typography.body, { color: c.textSecondary }]}> 
          {user?.name ? `Bem-vindo, ${user.name}.` : 'Sua sessão está ativa.'}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    justifyContent: 'center',
    padding: Spacing.lg,
  },
  card: {
    gap: Spacing.sm,
    borderWidth: 1,
    borderRadius: 18,
    padding: Spacing.lg,
  },
})
