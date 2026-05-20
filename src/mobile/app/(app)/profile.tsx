import { StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Spacing, Typography } from '@/constants/theme'

export default function ProfileScreen() {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  return (
    <View style={[styles.root, { backgroundColor: c.canvas }]}>
      <Text style={[Typography.h1, { color: c.textPrimary }]}>Perfil</Text>
      <Text style={[Typography.body, { color: c.textSecondary }]}>Tela de perfil em construção.</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    gap: Spacing.sm,
    padding: Spacing.lg,
    justifyContent: 'center',
  },
})
