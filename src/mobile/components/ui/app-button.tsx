// src/mobile/src/components/ui/app-button.tsx
import { ActivityIndicator, Pressable, StyleSheet, Text } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'

interface AppButtonProps {
  title: string
  onPress: () => void
  disabled?: boolean
  loading?: boolean
  variant?: 'primary' | 'outline' | 'ghost' | 'danger'
}

export function AppButton({
  title, onPress, disabled, loading, variant = 'primary',
}: AppButtonProps) {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const styles = StyleSheet.create({
    base: {
      alignItems: 'center',
      justifyContent: 'center',
      flexDirection: 'row',
      gap: Spacing.sm,
      borderRadius: Radius.full,
      paddingVertical: 13,
      paddingHorizontal: Spacing.lg,
      minHeight: 48,
      opacity: disabled || loading ? 0.55 : 1,
    },
    primary: { backgroundColor: c.accentDeep },
    outline: {
      backgroundColor: 'transparent',
      borderWidth: 1.5,
      borderColor: c.accent,
    },
    ghost: { backgroundColor: c.accentBg },
    danger: { backgroundColor: 'rgba(200,31,31,0.08)', borderWidth: 1, borderColor: 'rgba(200,31,31,0.25)' },
    primaryText: { color: '#fff', ...Typography.h3 },
    outlineText: { color: c.accentDeep, ...Typography.h3 },
    ghostText: { color: c.accentDeep, ...Typography.h3 },
    dangerText: { color: '#c81f1f', ...Typography.h3 },
  })

  return (
    <Pressable
      accessibilityRole='button'
      accessibilityState={{ disabled: !!disabled || !!loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={[styles.base, styles[variant]]}
    >
      {loading && <ActivityIndicator color={variant === 'primary' ? '#fff' : c.accent} size='small' />}
      <Text style={styles[`${variant}Text`]}>{title}</Text>
    </Pressable>
  )
}