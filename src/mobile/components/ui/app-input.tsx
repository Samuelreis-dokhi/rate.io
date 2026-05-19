// src/mobile/src/components/ui/app-input.tsx
import { StyleSheet, Text, TextInput, TextInputProps, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'

interface AppInputProps extends TextInputProps {
  label?: string
  error?: string
}

export function AppInput({ label, error, ...props }: AppInputProps) {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  return (
    <View style={{ gap: Spacing.xs }}>
      {label ? (
        <Text style={[Typography.label, { color: c.textSecondary, textTransform: 'uppercase', letterSpacing: 0.08 }]}>
          {label}
        </Text>
      ) : null}
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: c.surface,
            borderColor: error ? '#c81f1f' : c.border,
            color: c.textPrimary,
          },
        ]}
        placeholderTextColor={c.textSecondary}
        {...props}
      />
      {error ? (
        <Text style={{ ...Typography.caption, color: '#c81f1f' }}>{error}</Text>
      ) : null}
    </View>
  )
}

const styles = StyleSheet.create({
  input: {
    borderWidth: 1.5,
    borderRadius: Radius.md,
    paddingHorizontal: Spacing.md,
    paddingVertical: 12,
    fontSize: 15,
    minHeight: 48,
  },
})