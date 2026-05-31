// src/mobile/app/(app)/index.tsx
import { useCallback, useMemo, useState } from 'react'
import { RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useFocusEffect } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { getPublicProfile } from '@/src/features/auth/user-service'
import { getUserGroups } from '@/src/features/groups/group-service'
import { getGroupExpenses } from '@/src/features/expenses/expense-service'
import { StatCard } from '../../components/ui/stat-card'
import { EmptyState } from '../../components/ui/empty-state'
import { IconSymbol } from '../../components/ui/icon-symbol'
import { resolveUserId } from '@/src/utils/resolve-user-id'
import { formatMoney } from '@/src/utils/format'

type DashboardGroup = {
  _id: string
  name: string
  isActive?: boolean
  members: { userId: string }[]
}

type DashboardExpense = {
  _id: string
  description: string
  paidBy: string
  splits: {
    userId: string
    amount: number
    status: 'pendente' | 'pago' | string
  }[]
}

type DashboardData = {
  groups: DashboardGroup[]
  expensesMap: Record<string, DashboardExpense[]>
}

async function loadDashboardData(userId: string): Promise<DashboardData> {
  const groups = await getUserGroups(userId)
  const activeGroups = groups.filter((group) => group.isActive !== false)

  const entries = await Promise.all(
    activeGroups.map(async (group) => {
      try {
        return [group._id, await getGroupExpenses(group._id, userId)] as const
      } catch {
        return [group._id, [] as DashboardExpense[]] as const
      }
    })
  )

  return {
    groups,
    expensesMap: Object.fromEntries(entries),
  }
}

export default function DashboardScreen() {
  const { user, logout } = useAuth()
  const userId = resolveUserId(user as any)
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [groups, setGroups] = useState<DashboardGroup[]>([])
  const [profilesById, setProfilesById] = useState<Record<string, { name: string }>>({})
  const [expensesMap, setExpensesMap] = useState<Record<string, DashboardExpense[]>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      setRefreshing(false)
      return
    }

    try {
      const { groups: gs, expensesMap: nextExpensesMap } = await loadDashboardData(userId)
      setGroups(gs)
      setExpensesMap(nextExpensesMap)

      const ids = [...new Set([
        ...gs.flatMap((g) => g.members.map((m) => m.userId)),
        ...Object.values(nextExpensesMap).flatMap((exps) => exps.flatMap((exp) => [exp.paidBy, ...exp.splits.map((s) => s.userId)])),
      ])]
      const entries = await Promise.all(
        ids.map(async (id) => {
          try {
            return [id, await getPublicProfile(id)] as const
          } catch {
            return [id, { name: 'Membro' }] as const
          }
        })
      )
      setProfilesById(Object.fromEntries(entries))
    } catch {
      setGroups([])
      setExpensesMap({})
      setProfilesById({})
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userId])

  useFocusEffect(useCallback(() => { load() }, [load]))

  const onRefresh = useCallback(() => { setRefreshing(true); load() }, [load])

  const stats = useMemo(() => {
    let totalOwed = 0, totalToReceive = 0, unsettled = 0
    for (const list of Object.values(expensesMap)) {
      for (const exp of list) {
        const mine = exp.splits.find((s) => s.userId === userId)
        if (mine?.status === 'pendente' && exp.paidBy !== userId) { totalOwed += mine.amount; unsettled++ }
        if (exp.paidBy === userId) {
          for (const s of exp.splits) {
            if (s.userId !== userId && s.status === 'pendente') totalToReceive += s.amount
          }
        }
      }
    }
    return { totalOwed, totalToReceive, net: totalToReceive - totalOwed, groups: groups.filter((group) => group.isActive !== false).length, unsettled }
  }, [expensesMap, userId, groups])

  const pendingPayments = useMemo(() => {
    const list: { expId: string; gId: string; gName: string; desc: string; amount: number; toName: string }[] = []
    for (const [gId, exps] of Object.entries(expensesMap)) {
      const gName = groups.find((g) => g._id === gId)?.name ?? 'Grupo'
      for (const exp of exps) {
        const mine = exp.splits.find((s) => s.userId === userId)
        if (mine?.status === 'pendente' && exp.paidBy !== userId) {
          list.push({ expId: exp._id, gId, gName, desc: exp.description, amount: mine.amount, toName: profilesById[exp.paidBy]?.name ?? 'Membro' })
        }
      }
    }
    return list.sort((a, b) => b.amount - a.amount)
  }, [expensesMap, groups, profilesById, userId])

  const pendingReceivables = useMemo(() => {
    const list: { expId: string; userId: string; gId: string; gName: string; desc: string; amount: number; fromName: string }[] = []
    for (const [gId, exps] of Object.entries(expensesMap)) {
      const gName = groups.find((g) => g._id === gId)?.name ?? 'Grupo'
      for (const exp of exps) {
        if (exp.paidBy !== userId) continue

        for (const split of exp.splits) {
          if (split.userId !== userId && split.status === 'pendente') {
            list.push({
              expId: exp._id,
              userId: split.userId,
              gId,
              gName,
              desc: exp.description,
              amount: split.amount,
              fromName: profilesById[split.userId]?.name ?? 'Membro',
            })
          }
        }
      }
    }
    return list.sort((a, b) => b.amount - a.amount)
  }, [expensesMap, groups, profilesById, userId])

  if (loading) {
    return (
      <View style={[styles.center, { backgroundColor: c.canvas }]}>
        <Text style={[Typography.body, { color: c.textSecondary }]}>Carregando painel...</Text>
      </View>
    )
  }

  const netTone = stats.net > 0.01 ? 'positive' : stats.net < -0.01 ? 'negative' : 'neutral'

  return (
    <ScrollView
      style={{ backgroundColor: c.canvas }}
      contentContainerStyle={styles.content}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Cabeçalho */}
      <View style={styles.header}>
        <View>
          <Text style={[Typography.h1, { color: c.textPrimary }]}>
            Olá, {user?.name ?? 'Usuário'}!
          </Text>
          <Text style={[Typography.body, { color: c.textSecondary }]}>
            Aqui está o seu resumo financeiro.
          </Text>
        </View>
        <TouchableOpacity onPress={logout}>
          <Text style={[Typography.label, { color: c.accent }]}>Sair</Text>
        </TouchableOpacity>
      </View>

      {/* 4 stat cards */}
      <View style={styles.statsRow}>
        <StatCard label='A pagar' value={formatMoney(stats.totalOwed)} tone={stats.totalOwed > 0 ? 'negative' : 'neutral'} />
        <StatCard label='A receber' value={formatMoney(stats.totalToReceive)} tone={stats.totalToReceive > 0 ? 'positive' : 'neutral'} />
      </View>
      <View style={styles.statsRow}>
        <StatCard label='Saldo líquido' value={formatMoney(stats.net)} tone={netTone} />
        <StatCard label='Grupos ativos' value={String(stats.groups)} />
      </View>

      {/* Atalhos */}
      <View style={styles.shortcuts}>
        <TouchableOpacity
          style={[styles.shortcut, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => router.push('/(app)/groups')}
        >
          <View style={[styles.shortcutIcon, { backgroundColor: c.accentBg }]}>
            <IconSymbol name='person.3.fill' size={22} color={c.accentDeep} />
          </View>
          <Text style={[Typography.h3, { color: c.textPrimary }]}>Meus Grupos</Text>
          <Text style={[Typography.caption, { color: c.textSecondary }]}>Gerencie grupos de despesas</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.shortcut, { backgroundColor: c.surface, borderColor: c.border }]}
          onPress={() => router.push('/(app)/activities')}
        >
          <View style={[styles.shortcutIcon, { backgroundColor: c.accentBg }]}>
            <IconSymbol name='list.bullet' size={22} color={c.accentDeep} />
          </View>
          <Text style={[Typography.h3, { color: c.textPrimary }]}>Atividades</Text>
          <Text style={[Typography.caption, { color: c.textSecondary }]}>
            {stats.unsettled > 0 ? `${stats.unsettled} pendência(s)` : 'Tudo em dia!'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* O que preciso pagar */}
      <View style={styles.section}>
        <Text style={[Typography.h2, { color: c.textPrimary, marginBottom: Spacing.md }]}>
          O que você precisa pagar
        </Text>
        {pendingPayments.length === 0 ? (
          <EmptyState icon='OK' message='Nenhum pagamento pendente. Tudo acertado!' />
        ) : (
          pendingPayments.map((item) => (
            <View key={item.expId} style={[styles.pendingCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.h3, { color: c.textPrimary }]}>{item.desc}</Text>
                <Text style={[Typography.caption, { color: c.textSecondary }]}>
                  {item.gName} · Para {item.toName}
                </Text>
              </View>
              <Text style={[Typography.h3, { color: c.negative }]}>{formatMoney(item.amount)}</Text>
            </View>
          ))
        )}
      </View>

      {/* O que preciso receber */}
      <View style={styles.section}>
        <Text style={[Typography.h2, { color: c.textPrimary, marginBottom: Spacing.md }]}>
          O que você precisa receber
        </Text>
        {pendingReceivables.length === 0 ? (
          <EmptyState icon='OK' message='Nenhum recebimento pendente.' />
        ) : (
          pendingReceivables.map((item) => (
            <View key={item.expId + '-' + item.userId} style={[styles.pendingCard, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={{ flex: 1 }}>
                <Text style={[Typography.h3, { color: c.textPrimary }]}>{item.desc}</Text>
                <Text style={[Typography.caption, { color: c.textSecondary }]}>
                  {item.gName} · De {item.fromName}
                </Text>
              </View>
              <Text style={[Typography.h3, { color: c.positive }]}>{formatMoney(item.amount)}</Text>
            </View>
          ))
        )}
      </View>
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  shortcuts: { flexDirection: 'row', gap: Spacing.md },
  shortcut: { flex: 1, borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.md, gap: Spacing.xs },
  shortcutIcon: { width: 40, height: 40, borderRadius: Radius.full, alignItems: 'center', justifyContent: 'center' },
  section: {},
  pendingCard: { flexDirection: 'row', alignItems: 'center', gap: Spacing.md, borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, marginBottom: Spacing.sm },
})
