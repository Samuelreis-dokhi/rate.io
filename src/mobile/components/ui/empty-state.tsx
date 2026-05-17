// src/mobile/src/components/ui/empty-state.tsx
import { ReactNode } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'

interface EmptyStateProps { icon?: string; message: string; action?: ReactNode }

export function EmptyState({ icon = '📭', message, action }: EmptyStateProps) {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  return (
    <View style={[styles.container, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={[Typography.body, { color: c.textSecondary, textAlign: 'center' }]}>
        {message}
      </Text>
      {action}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    padding: Spacing.xl,
    borderRadius: Radius.xl,
    borderWidth: 1,
    gap: Spacing.md,
    borderStyle: 'dashed',
  },
  icon: { fontSize: 32 },
})