// src/mobile/src/components/ui/activity-item.tsx
import { StyleSheet, Text, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'
import { formatDate } from '@/src/utils/format'

const ICONS: Record<string, string> = {
  GROUP_CREATED: '🎉', MEMBER_ADDED: '👋', EXPENSE_CREATED: '💸',
  PAYMENT_SETTLED: '✅', EXPENSE_UPDATED: '✏️', EXPENSE_DELETED: '❌', GROUP_DELETED: '🗑️',
}

interface Activity {
  _id: string; type: string; message: string; createdAt: string
}

interface ActivityItemProps { activity: Activity; groupName?: string }

export function ActivityItem({ activity, groupName }: ActivityItemProps) {
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  return (
    <View style={[styles.container, { backgroundColor: c.surface, borderColor: c.border }]}>
      <View style={[styles.iconWrap, { backgroundColor: c.canvas, borderColor: c.border }]}>
        <Text style={styles.icon}>{ICONS[activity.type] ?? '📌'}</Text>
      </View>
      <View style={styles.body}>
        {groupName ? (
          <View style={[styles.badge, { backgroundColor: c.accentBg }]}>
            <Text style={[Typography.label, { color: c.accentDeep }]}>{groupName}</Text>
          </View>
        ) : null}
        <Text style={[Typography.body, { color: c.textPrimary }]}>{activity.message}</Text>
        <Text style={[Typography.caption, { color: c.textSecondary }]}>
          {formatDate(activity.createdAt)}
        </Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: { flexDirection: 'row', gap: Spacing.md, padding: Spacing.md, borderRadius: Radius.lg, borderWidth: 1 },
  iconWrap: { width: 40, height: 40, borderRadius: Radius.md, alignItems: 'center', justifyContent: 'center', borderWidth: 1, flexShrink: 0 },
  icon: { fontSize: 18 },
  body: { flex: 1, gap: Spacing.xs },
  badge: { alignSelf: 'flex-start', paddingHorizontal: Spacing.sm, paddingVertical: 2, borderRadius: Radius.full },
})