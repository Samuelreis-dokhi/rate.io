import { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useAuth } from '@/src/features/auth/auth-context'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Spacing, Typography } from '@/constants/theme'

export default function LogoutScreen() {
  const { logout } = useAuth()
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  useEffect(() => {
    logout()
  }, [logout])

  return (
    <View style={[styles.root, { backgroundColor: c.canvas }]}> 
      <Text style={[Typography.body, { color: c.textSecondary }]}>Saindo...</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
  },
})
