// src/mobile/app/(app)/activities.tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { FlatList, RefreshControl, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { getGroupActivities, getUserGroups, type Activity, type Group } from '@/src/features/groups/group-service'
import { ActivityItem } from '@/components/ui/activity-item'
import { EmptyState } from '@/components/ui/empty-state'
import { resolveUserId } from '@/src/utils/resolve-user-id'

const TYPES = [
  { key: 'all', label: 'Todos' },
  { key: 'EXPENSE_CREATED', label: 'Despesas' },
  { key: 'PAYMENT_SETTLED', label: 'Pagamentos' },
  { key: 'MEMBER_ADDED', label: 'Membros' },
]

export default function ActivitiesScreen() {
  const { user } = useAuth()
  const userId = resolveUserId(user as Record<string, unknown>)
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [groups, setGroups] = useState<Group[]>([])
  const [activitiesMap, setActivitiesMap] = useState<Record<string, Activity[]>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [filterType, setFilterType] = useState('all')

  const load = useCallback(async () => {
    if (!userId) return
    try {
      const gs = await getUserGroups(userId)
      setGroups(gs)
      const entries = await Promise.all(
        gs.map(async (g) => {
          try { return [g._id, await getGroupActivities(g._id, userId)] }
          catch { return [g._id, [] as Activity[]] }
        })
      )
      setActivitiesMap(Object.fromEntries(entries))
    } catch { /* silencioso */ }
    finally { setLoading(false); setRefreshing(false) }
  }, [userId])

  useEffect(() => { load() }, [load])

  const allActivities = useMemo(() => {
    const list: (Activity & { groupName: string })[] = []
    for (const [gId, acts] of Object.entries(activitiesMap)) {
      const gName = groups.find((g) => g._id === gId)?.name ?? 'Grupo'
      for (const a of acts) list.push({ ...a, groupName: gName })
    }
    return list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
  }, [activitiesMap, groups])

  const filtered = filterType === 'all' ? allActivities : allActivities.filter((a) => a.type === filterType)

  return (
    <View style={[styles.root, { backgroundColor: c.canvas }]}>
      <Text style={[Typography.h1, { color: c.textPrimary, padding: Spacing.lg, paddingBottom: Spacing.sm }]}>
        Atividades
      </Text>

      {/* Filtros */}
      <View style={styles.filters}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t.key}
            style={[styles.chip, { backgroundColor: filterType === t.key ? c.accentDeep : c.surface, borderColor: c.border }]}
            onPress={() => setFilterType(t.key)}
          >
            <Text style={[Typography.caption, { color: filterType === t.key ? '#fff' : c.textSecondary, fontWeight: '700' }]}>
              {t.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: Spacing.lg, gap: Spacing.sm }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} />}
        ListEmptyComponent={
          loading ? (
            <Text style={[Typography.body, { color: c.textSecondary, textAlign: 'center', paddingTop: 40 }]}>
              Carregando atividades...
            </Text>
          ) : (
            <EmptyState icon='📋' message='Nenhuma atividade ainda.' />
          )
        }
        renderItem={({ item }) => <ActivityItem activity={item} groupName={item.groupName} />}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  filters: { flexDirection: 'row', gap: Spacing.sm, paddingHorizontal: Spacing.lg, flexWrap: 'wrap', marginBottom: Spacing.sm },
  chip: { borderRadius: 999, borderWidth: 1, paddingHorizontal: Spacing.md, paddingVertical: Spacing.xs },
})
