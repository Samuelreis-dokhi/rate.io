// src/mobile/src/components/ui/stat-card.tsx
import { StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'

type Tone = 'neutral' | 'positive' | 'negative'

interface StatCardProps { label: string; value: string | number; tone?: Tone }

export function StatCard({ label, value, tone = 'neutral' }: StatCardProps) {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']
  const valueColor = tone === 'positive' ? c.positive : tone === 'negative' ? c.negative : c.textPrimary

  return (
    <View style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}>
      <Text style={[styles.label, { color: c.textSecondary }]}>{label}</Text>
      <Text style={[styles.value, { color: valueColor }]}>{value}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  card: {
    flex: 1,
    borderWidth: 1,
    borderRadius: Radius.lg,
    padding: Spacing.md,
  },
  label: {
    ...Typography.label,
    textTransform: 'uppercase',
    marginBottom: Spacing.xs,
  },
  value: {
    fontSize: 20,
    fontWeight: '700',
  },
})