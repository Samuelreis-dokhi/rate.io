// src/mobile/app/(app)/groups/[groupId].tsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Alert, Modal, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import { router, useLocalSearchParams } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import {
  deleteGroup,
  getGroupActivities,
  getUserGroups,
  inviteToGroup,
  type Activity,
  type Group,
} from '@/src/features/groups/group-service'
import {
  createExpense,
  getGroupBalance,
  getGroupExpenses,
  settleExpenseShare,
  type Expense,
  type GroupBalance,
} from '@/src/features/expenses/expense-service'
import { getPublicProfile, type UserProfile } from '@/src/features/auth/user-service'
import { ActivityItem } from '@/components/ui/activity-item'
import { AppButton } from '@/components/ui/app-button'
import { AppInput } from '@/components/ui/app-input'
import { EmptyState } from '@/components/ui/empty-state'
import { StatCard } from '@/components/ui/stat-card'
import { resolveUserId } from '@/src/utils/resolve-user-id'
import { formatDate, formatMoney } from '@/src/utils/format'

type SplitType = 'igual' | 'porcentagem' | 'exato'

const SPLIT_TYPES: { value: SplitType; label: string }[] = [
  { value: 'igual', label: 'Igual' },
  { value: 'porcentagem', label: '%' },
  { value: 'exato', label: 'Valor' },
]

type MemberView = Group['members'][number] & {
  name: string
  email: string
}

type ExpenseFormState = {
  description: string
  amount: string
  currency: string
  splitType: SplitType
  paidBy: string
}

type SplitPayload = {
  userId: string
  percentage?: number
  amount?: number
}

type PendingPayment = {
  expenseId: string
  description: string
  amount: number
  currency: string
  paidToName: string
  createdAt: string
}

type PendingReceivement = {
  key: string
  description: string
  amount: number
  currency: string
  fromName: string
  createdAt: string
}

export default function GroupDetailScreen() {
  const { groupId } = useLocalSearchParams<{ groupId: string }>()
  const { user } = useAuth()
  const userId = resolveUserId(user as unknown as Record<string, unknown>)
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [group, setGroup] = useState<Group | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [activities, setActivities] = useState<Activity[]>([])
  const [balance, setBalance] = useState<GroupBalance | null>(null)
  const [profilesById, setProfilesById] = useState<Record<string, UserProfile>>({})
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [showExpense, setShowExpense] = useState(false)
  const [expenseForm, setExpenseForm] = useState<ExpenseFormState>({
    description: '',
    amount: '',
    currency: 'BRL',
    splitType: 'igual',
    paidBy: '',
  })
  const [selectedMemberIds, setSelectedMemberIds] = useState<string[]>([])
  const [splitValues, setSplitValues] = useState<Record<string, string>>({})
  const [expenseError, setExpenseError] = useState('')
  const [expenseLoading, setExpenseLoading] = useState(false)

  const load = useCallback(async () => {
    if (!groupId || !userId) {
      setLoading(false)
      setRefreshing(false)
      return
    }

    try {
      const allGroups = await getUserGroups(userId)
      const found = allGroups.find((item) => item._id === groupId)

      if (!found) {
        Alert.alert('Grupo não encontrado', 'Você não tem acesso a este grupo.')
        router.replace('/(app)/groups')
        return
      }

      setGroup(found)

      const memberIds = found.members.map((member) => String(member.userId))
      const profileEntries = await Promise.all(
        memberIds.map(async (id) => {
          try {
            return [id, await getPublicProfile(id)] as const
          } catch {
            return [id, { _id: id, name: 'Membro', email: '', authId: '', isActive: true }] as const
          }
        })
      )
      setProfilesById(Object.fromEntries(profileEntries))

      const [nextExpenses, nextActivities, nextBalance] = await Promise.all([
        getGroupExpenses(groupId, userId),
        getGroupActivities(groupId, userId),
        getGroupBalance(groupId, userId),
      ])

      setExpenses(nextExpenses)
      setActivities(nextActivities)
      setBalance(nextBalance)
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [groupId, userId])

  useEffect(() => { load() }, [load])

  const members = useMemo<MemberView[]>(() => {
    if (!group) return []

    return group.members
      .map((member) => {
        const id = String(member.userId)

        return {
          ...member,
          userId: id,
          name: profilesById[id]?.name ?? 'Membro',
          email: profilesById[id]?.email ?? '',
        }
      })
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [group, profilesById])

  const isCreator = Boolean(group && String(group.createdBy) === userId)
  const hasPending = expenses.some((expense) => expense.splits.some((split) => split.status === 'pendente'))

  const myPendingPayments = useMemo<PendingPayment[]>(() =>
    expenses
      .map((expense) => {
        const mine = expense.splits.find((split) => String(split.userId) === userId)
        if (!mine || mine.status !== 'pendente' || String(expense.paidBy) === userId) return null

        return {
          expenseId: expense._id,
          description: expense.description,
          amount: Number(mine.amount || 0),
          currency: expense.currency || 'BRL',
          paidToName: profilesById[String(expense.paidBy)]?.name ?? 'Membro',
          createdAt: expense.createdAt,
        }
      })
      .filter((item): item is PendingPayment => item !== null),
    [expenses, profilesById, userId]
  )

  const myPendingReceivements = useMemo<PendingReceivement[]>(() => {
    const list: PendingReceivement[] = []

    for (const expense of expenses) {
      if (String(expense.paidBy) !== userId) continue

      for (const split of expense.splits) {
        const splitUserId = String(split.userId)
        if (splitUserId === userId || split.status !== 'pendente') continue

        list.push({
          key: `${expense._id}-${splitUserId}`,
          description: expense.description,
          amount: Number(split.amount || 0),
          currency: expense.currency || 'BRL',
          fromName: profilesById[splitUserId]?.name ?? 'Membro',
          createdAt: expense.createdAt,
        })
      }
    }

    return list
  }, [expenses, profilesById, userId])

  const exactTotal = useMemo(() => {
    if (expenseForm.splitType !== 'exato') return null
    return selectedMemberIds.reduce((sum, id) => sum + parseCurrencyNumber(splitValues[id]), 0)
  }, [expenseForm.splitType, selectedMemberIds, splitValues])

  const percentageTotal = useMemo(() => {
    if (expenseForm.splitType !== 'porcentagem') return null
    return selectedMemberIds.reduce((sum, id) => sum + parseCurrencyNumber(splitValues[id]), 0)
  }, [expenseForm.splitType, selectedMemberIds, splitValues])

  const openExpenseModal = () => {
    const memberIds = members.map((member) => member.userId)
    setExpenseForm({
      description: '',
      amount: '',
      currency: 'BRL',
      splitType: 'igual',
      paidBy: userId || memberIds[0] || '',
    })
    setSelectedMemberIds(memberIds)
    setSplitValues(Object.fromEntries(memberIds.map((id) => [id, ''])))
    setExpenseError('')
    setShowExpense(true)
  }

  const closeExpenseModal = () => {
    if (expenseLoading) return
    setShowExpense(false)
    setExpenseError('')
  }

  const toggleSplitMember = (memberId: string) => {
    setSelectedMemberIds((current) => (
      current.includes(memberId)
        ? current.filter((id) => id !== memberId)
        : [...current, memberId]
    ))
  }

  const buildSplitsData = (): SplitPayload[] => {
    if (expenseForm.splitType === 'igual') {
      return selectedMemberIds.map((id) => ({ userId: id }))
    }

    if (expenseForm.splitType === 'porcentagem') {
      return selectedMemberIds.map((id) => ({ userId: id, percentage: parseCurrencyNumber(splitValues[id]) }))
    }

    return selectedMemberIds.map((id) => ({ userId: id, amount: parseCurrencyNumber(splitValues[id]) }))
  }

  const handleCreateExpense = async () => {
    if (!groupId || !userId) return

    const amount = parseCurrencyNumber(expenseForm.amount)
    const currency = expenseForm.currency.trim().toUpperCase() || 'BRL'

    if (!expenseForm.description.trim()) {
      setExpenseError('Informe a descrição da despesa.')
      return
    }

    if (amount <= 0) {
      setExpenseError('Informe um valor maior que zero.')
      return
    }

    if (!expenseForm.paidBy || !members.some((member) => member.userId === expenseForm.paidBy)) {
      setExpenseError('Selecione um pagador do grupo.')
      return
    }

    if (selectedMemberIds.length === 0) {
      setExpenseError('Selecione ao menos um membro para dividir a despesa.')
      return
    }

    if (expenseForm.splitType === 'porcentagem' && Math.abs((percentageTotal ?? 0) - 100) > 0.01) {
      setExpenseError(`As porcentagens devem somar 100%. Atual: ${(percentageTotal ?? 0).toFixed(1)}%`)
      return
    }

    if (expenseForm.splitType === 'exato' && Math.abs((exactTotal ?? 0) - amount) > 0.01) {
      setExpenseError(`Os valores devem somar ${formatMoney(amount, currency)}. Atual: ${formatMoney(exactTotal ?? 0, currency)}`)
      return
    }

    setExpenseLoading(true)
    setExpenseError('')

    try {
      await createExpense({
        groupId,
        description: expenseForm.description.trim(),
        amount,
        currency,
        paidBy: expenseForm.paidBy,
        createdBy: userId,
        splitType: expenseForm.splitType,
        splitsData: buildSplitsData(),
      })
      setShowExpense(false)
      await load()
      Alert.alert('Despesa registrada', 'O resumo do grupo foi atualizado.')
    } catch (err) {
      setExpenseError((err as Error).message)
    } finally {
      setExpenseLoading(false)
    }
  }

  const onRefresh = useCallback(() => {
    setRefreshing(true)
    load()
  }, [load])

  const handleSettle = async (expenseId: string) => {
    if (!userId) return

    try {
      await settleExpenseShare(expenseId, userId)
      await load()
      Alert.alert('Pagamento registrado', 'Sua parte foi marcada como paga.')
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    }
  }

  const handleInvite = async () => {
    if (!groupId || !userId || !inviteEmail.trim()) return

    setInviteLoading(true)
    try {
      await inviteToGroup(groupId, { email: inviteEmail.trim().toLowerCase(), addedBy: userId })
      setInviteEmail('')
      setShowInvite(false)
      await load()
      Alert.alert('Membro adicionado', 'O grupo foi atualizado.')
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    } finally {
      setInviteLoading(false)
    }
  }

  const handleDelete = () => {
    if (!groupId || !isCreator) return

    if (hasPending) {
      Alert.alert('Não é possível excluir', 'Quite todos os pagamentos pendentes antes de excluir o grupo.')
      return
    }

    Alert.alert('Excluir grupo?', `O grupo "${group?.name}" será removido para todos os membros.`, [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGroup(groupId, userId)
            router.replace('/(app)/groups')
          } catch (err) {
            Alert.alert('Erro', (err as Error).message)
          }
        },
      },
    ])
  }

  if (loading || !group) {
    return (
      <View style={[styles.center, { backgroundColor: c.canvas }]}>
        <Text style={[Typography.body, { color: c.textSecondary }]}>Carregando grupo...</Text>
      </View>
    )
  }

  const netBalance = Number(balance?.netBalance ?? 0)
  const netTone = netBalance > 0.01 ? 'positive' : netBalance < -0.01 ? 'negative' : 'neutral'

  return (
    <View style={[styles.root, { backgroundColor: c.canvas }]}>
      <View style={[styles.header, { backgroundColor: c.canvas, borderBottomColor: c.border }]}>
        <TouchableOpacity onPress={() => router.replace('/(app)/groups')}>
          <Text style={[Typography.body, styles.backText, { color: c.accentDeep }]}>Voltar</Text>
        </TouchableOpacity>

        <View style={styles.headerActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: c.accentDeep }]} onPress={openExpenseModal}>
            <Text style={[Typography.caption, styles.actionText, { color: '#fff' }]}>Despesa</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: c.accentBg }]} onPress={() => setShowInvite(true)}>
            <Text style={[Typography.caption, styles.actionText, { color: c.accentDeep }]}>Convidar</Text>
          </TouchableOpacity>
          {isCreator ? (
            <TouchableOpacity style={[styles.actionBtn, { backgroundColor: 'rgba(200,31,31,0.08)' }]} onPress={handleDelete}>
              <Text style={[Typography.caption, styles.actionText, { color: c.negative }]}>Excluir</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        <View style={styles.titleBlock}>
          <Text style={[Typography.h1, { color: c.textPrimary }]}>{group.name}</Text>
          {group.description ? (
            <Text style={[Typography.body, { color: c.textSecondary }]}>{group.description}</Text>
          ) : null}
        </View>

        <SectionTitle title='Resumo do grupo' count={expenses.length} color={c.textPrimary} mutedColor={c.textSecondary} />
        <View style={styles.statsRow}>
          <StatCard label='A receber' value={formatMoney(balance?.totalPaid ?? 0)} tone={(balance?.totalPaid ?? 0) > 0 ? 'positive' : 'neutral'} />
          <StatCard label='A pagar' value={formatMoney(balance?.totalOwed ?? 0)} tone={(balance?.totalOwed ?? 0) > 0 ? 'negative' : 'neutral'} />
        </View>
        <View style={styles.statsRow}>
          <StatCard label='Saldo líquido' value={formatMoney(netBalance)} tone={netTone} />
          <StatCard label='Membros' value={String(group.members.length)} />
        </View>

        <View style={styles.section}>
          <SectionTitle title='Despesas' count={expenses.length} color={c.textPrimary} mutedColor={c.textSecondary} />
          {expenses.length === 0 ? (
            <EmptyState icon='💸' message='Nenhuma despesa ainda.' action={
              <AppButton title='Adicionar despesa' onPress={openExpenseModal} />
            } />
          ) : (
            expenses.map((expense) => {
              const mine = expense.splits.find((split) => String(split.userId) === userId)
              const canSettle = mine?.status === 'pendente' && String(expense.paidBy) !== userId

              return (
                <View key={expense._id} style={[styles.expenseCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                  <View style={styles.expenseHeader}>
                    <Text style={[Typography.h3, styles.flexText, { color: c.textPrimary }]}>{expense.description}</Text>
                    <Text style={[Typography.h3, { color: c.textPrimary }]}>{formatMoney(expense.amount, expense.currency)}</Text>
                  </View>
                  <Text style={[Typography.caption, { color: c.textSecondary }]}>
                    Pago por {profilesById[String(expense.paidBy)]?.name ?? 'Membro'} · {formatDate(expense.createdAt)}
                  </Text>
                  <View style={styles.splits}>
                    {expense.splits.map((split) => {
                      const isPaid = split.status === 'pago'
                      const statusColor = isPaid ? c.positive : c.negative

                      return (
                        <View
                          key={`${expense._id}-${split.userId}`}
                          style={[
                            styles.splitPill,
                            { backgroundColor: isPaid ? 'rgba(12,124,79,0.08)' : 'rgba(200,31,31,0.06)' },
                          ]}
                        >
                          <Text style={[Typography.caption, styles.splitText, { color: statusColor }]}>
                            {profilesById[String(split.userId)]?.name ?? 'Membro'}: {formatMoney(split.amount, expense.currency)}
                          </Text>
                        </View>
                      )
                    })}
                  </View>
                  {canSettle ? (
                    <AppButton
                      title={`Registrar pagamento (${formatMoney(mine.amount, expense.currency)})`}
                      onPress={() => handleSettle(expense._id)}
                      variant='outline'
                    />
                  ) : null}
                </View>
              )
            })
          )}
        </View>

        <View style={styles.section}>
          <SectionTitle title='Membros' count={members.length} color={c.textPrimary} mutedColor={c.textSecondary} />
          {members.map((member) => (
            <View key={member.userId} style={[styles.memberItem, { backgroundColor: c.surface, borderColor: c.border }]}>
              <View style={styles.memberText}>
                <Text style={[Typography.body, styles.memberName, { color: c.textPrimary }]}>{member.name}</Text>
                {member.email ? <Text style={[Typography.caption, { color: c.textSecondary }]}>{member.email}</Text> : null}
              </View>
              <View style={[styles.roleBadge, { backgroundColor: member.role === 'admin' ? c.accentBg : c.canvas }]}>
                <Text style={[Typography.caption, styles.roleText, { color: c.accentDeep }]}>
                  {member.role === 'admin' ? 'Admin' : 'Membro'}
                </Text>
              </View>
            </View>
          ))}
        </View>

        <View style={styles.section}>
          <SectionTitle title='Meus pagamentos pendentes' count={myPendingPayments.length} color={c.textPrimary} mutedColor={c.textSecondary} />
          {myPendingPayments.length === 0 ? (
            <EmptyState icon='OK' message='Tudo pago!' />
          ) : (
            myPendingPayments.map((payment) => (
              <View key={payment.expenseId} style={[styles.pendingCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={styles.flexText}>
                  <Text style={[Typography.h3, { color: c.textPrimary }]}>{payment.description}</Text>
                  <Text style={[Typography.caption, { color: c.textSecondary }]}>Para {payment.paidToName} · {formatDate(payment.createdAt)}</Text>
                  <Text style={[Typography.h3, { color: c.negative }]}>{formatMoney(payment.amount, payment.currency)}</Text>
                </View>
                <AppButton title='Pagar' onPress={() => handleSettle(payment.expenseId)} variant='outline' />
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <SectionTitle title='Meus recebimentos pendentes' count={myPendingReceivements.length} color={c.textPrimary} mutedColor={c.textSecondary} />
          {myPendingReceivements.length === 0 ? (
            <EmptyState icon='OK' message='Nenhum recebimento pendente.' />
          ) : (
            myPendingReceivements.map((receivement) => (
              <View key={receivement.key} style={[styles.pendingCard, { backgroundColor: c.surface, borderColor: c.border }]}>
                <View style={styles.flexText}>
                  <Text style={[Typography.h3, { color: c.textPrimary }]}>{receivement.description}</Text>
                  <Text style={[Typography.caption, { color: c.textSecondary }]}>De {receivement.fromName} · {formatDate(receivement.createdAt)}</Text>
                </View>
                <Text style={[Typography.h3, { color: c.positive }]}>{formatMoney(receivement.amount, receivement.currency)}</Text>
              </View>
            ))
          )}
        </View>

        <View style={styles.section}>
          <SectionTitle title='Atividades' count={activities.length} color={c.textPrimary} mutedColor={c.textSecondary} />
          {activities.length === 0 ? (
            <EmptyState icon='📋' message='Nenhuma atividade registrada ainda.' />
          ) : (
            activities.slice(0, 10).map((activity) => <ActivityItem key={activity._id} activity={activity} />)
          )}
        </View>
      </ScrollView>


      <Modal visible={showExpense} animationType='slide' presentationStyle='pageSheet' onRequestClose={closeExpenseModal}>
        <View style={[styles.modal, { backgroundColor: c.canvas }]}> 
          <View style={styles.modalHeader}>
            <Text style={[Typography.h1, { color: c.textPrimary }]}>Nova despesa</Text>
            <TouchableOpacity onPress={closeExpenseModal} disabled={expenseLoading}>
              <Text style={[Typography.body, { color: c.accent }]}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.modalScroll} keyboardShouldPersistTaps='handled'>
            <AppInput
              label='Descrição'
              placeholder='Ex: Jantar no restaurante'
              value={expenseForm.description}
              onChangeText={(description) => setExpenseForm((current) => ({ ...current, description }))}
            />

            <View style={styles.formRow}>
              <View style={styles.flexText}>
                <AppInput
                  label='Valor'
                  placeholder='0,00'
                  value={expenseForm.amount}
                  onChangeText={(amount) => setExpenseForm((current) => ({ ...current, amount }))}
                  keyboardType='decimal-pad'
                />
              </View>
              <View style={styles.currencyInput}>
                <AppInput
                  label='Moeda'
                  placeholder='BRL'
                  value={expenseForm.currency}
                  onChangeText={(currency) => setExpenseForm((current) => ({ ...current, currency: currency.toUpperCase().slice(0, 3) }))}
                  autoCapitalize='characters'
                  maxLength={3}
                />
              </View>
            </View>

            <View style={styles.formBlock}>
              <Text style={[Typography.label, styles.upperLabel, { color: c.textSecondary }]}>Pago por</Text>
              <View style={styles.wrapRow}>
                {members.map((member) => {
                  const selected = expenseForm.paidBy === member.userId
                  return (
                    <TouchableOpacity
                      key={member.userId}
                      style={[styles.choiceChip, { backgroundColor: selected ? c.accentDeep : c.surface, borderColor: c.border }]}
                      onPress={() => setExpenseForm((current) => ({ ...current, paidBy: member.userId }))}
                    >
                      <Text style={[Typography.caption, styles.choiceText, { color: selected ? '#fff' : c.textPrimary }]}>{member.name}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            <View style={styles.formBlock}>
              <Text style={[Typography.label, styles.upperLabel, { color: c.textSecondary }]}>Tipo de divisão</Text>
              <View style={styles.segmentedControl}>
                {SPLIT_TYPES.map(({ value, label }) => {
                  const selected = expenseForm.splitType === value
                  return (
                    <TouchableOpacity
                      key={value}
                      style={[styles.segment, { backgroundColor: selected ? c.accentDeep : c.surface, borderColor: c.border }]}
                      onPress={() => setExpenseForm((current) => ({ ...current, splitType: value }))}
                    >
                      <Text style={[Typography.caption, styles.choiceText, { color: selected ? '#fff' : c.textSecondary }]}>{label}</Text>
                    </TouchableOpacity>
                  )
                })}
              </View>
            </View>

            <View style={styles.formBlock}>
              <Text style={[Typography.label, styles.upperLabel, { color: c.textSecondary }]}>Dividir entre</Text>
              {members.map((member) => {
                const selected = selectedMemberIds.includes(member.userId)
                const equalPreview = parseCurrencyNumber(expenseForm.amount) > 0 && selectedMemberIds.length > 0
                  ? formatMoney(parseCurrencyNumber(expenseForm.amount) / selectedMemberIds.length, expenseForm.currency || 'BRL')
                  : ''

                return (
                  <View key={member.userId} style={[styles.splitMemberRow, { backgroundColor: c.surface, borderColor: c.border }]}> 
                    <TouchableOpacity style={styles.splitMemberName} onPress={() => toggleSplitMember(member.userId)}>
                      <View style={[styles.checkbox, { borderColor: selected ? c.accentDeep : c.border, backgroundColor: selected ? c.accentDeep : 'transparent' }]}>
                        <Text style={[Typography.caption, { color: '#fff' }]}>{selected ? 'OK' : ''}</Text>
                      </View>
                      <View style={styles.flexText}>
                        <Text style={[Typography.body, styles.memberName, { color: c.textPrimary }]}>{member.name}</Text>
                        {expenseForm.splitType === 'igual' && selected && equalPreview ? (
                          <Text style={[Typography.caption, { color: c.textSecondary }]}>{equalPreview}</Text>
                        ) : null}
                      </View>
                    </TouchableOpacity>

                    {expenseForm.splitType !== 'igual' && selected ? (
                      <View style={styles.splitValueInput}>
                        <AppInput
                          placeholder={expenseForm.splitType === 'porcentagem' ? '%' : '0,00'}
                          value={splitValues[member.userId] || ''}
                          onChangeText={(value) => setSplitValues((current) => ({ ...current, [member.userId]: value }))}
                          keyboardType='decimal-pad'
                        />
                      </View>
                    ) : null}
                  </View>
                )
              })}
            </View>

            {percentageTotal !== null ? (
              <Text style={[Typography.body, styles.splitIndicator, { color: Math.abs(percentageTotal - 100) <= 0.01 ? c.positive : c.negative }]}>Total: {percentageTotal.toFixed(1)}%</Text>
            ) : null}

            {exactTotal !== null && expenseForm.amount ? (
              <Text style={[Typography.body, styles.splitIndicator, { color: Math.abs(exactTotal - parseCurrencyNumber(expenseForm.amount)) <= 0.01 ? c.positive : c.negative }]}>Soma: {formatMoney(exactTotal, expenseForm.currency || 'BRL')} / {formatMoney(parseCurrencyNumber(expenseForm.amount), expenseForm.currency || 'BRL')}</Text>
            ) : null}

            {expenseError ? <Text style={[Typography.body, { color: c.negative }]}>{expenseError}</Text> : null}

            <AppButton
              title={expenseLoading ? 'Registrando...' : 'Registrar despesa'}
              onPress={handleCreateExpense}
              loading={expenseLoading}
              disabled={expenseLoading || selectedMemberIds.length === 0}
            />
          </ScrollView>
        </View>
      </Modal>

      <Modal visible={showInvite} animationType='slide' presentationStyle='pageSheet' onRequestClose={() => setShowInvite(false)}>
        <View style={[styles.modal, { backgroundColor: c.canvas }]}>
          <View style={styles.modalHeader}>
            <Text style={[Typography.h1, { color: c.textPrimary }]}>Convidar membro</Text>
            <TouchableOpacity onPress={() => setShowInvite(false)}>
              <Text style={[Typography.body, { color: c.accent }]}>Fechar</Text>
            </TouchableOpacity>
          </View>

          <AppInput
            label='E-mail'
            placeholder='amigo@exemplo.com'
            value={inviteEmail}
            onChangeText={setInviteEmail}
            keyboardType='email-address'
            autoCapitalize='none'
            autoCorrect={false}
          />
          <Text style={[Typography.caption, { color: c.textSecondary }]}>O usuário precisa já ter uma conta no RATE.IO.</Text>
          <AppButton
            title={inviteLoading ? 'Convidando...' : 'Convidar'}
            onPress={handleInvite}
            loading={inviteLoading}
            disabled={inviteLoading || !inviteEmail.trim()}
          />
        </View>
      </Modal>
    </View>
  )
}

function parseCurrencyNumber(value: string | number | undefined): number {
  if (value === undefined) return 0
  const normalized = String(value).replace(',', '.').trim()
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function SectionTitle({
  title,
  count,
  color,
  mutedColor,
}: {
  title: string
  count: number
  color: string
  mutedColor: string
}) {
  return (
    <View style={styles.sectionTitle}>
      <Text style={[Typography.h2, { color }]}>{title}</Text>
      <Text style={[Typography.caption, { color: mutedColor }]}>{count}</Text>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.lg,
    borderBottomWidth: 1,
  },
  backText: { fontWeight: '700' },
  headerActions: { flexDirection: 'row', gap: Spacing.sm },
  actionBtn: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  actionText: { fontWeight: '700' },
  content: { padding: Spacing.lg, gap: Spacing.lg, paddingBottom: Spacing.xxl },
  titleBlock: { gap: Spacing.xs },
  statsRow: { flexDirection: 'row', gap: Spacing.md },
  section: { gap: Spacing.sm },
  sectionTitle: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  expenseCard: { borderRadius: Radius.lg, borderWidth: 1, padding: Spacing.md, gap: Spacing.sm },
  expenseHeader: { flexDirection: 'row', justifyContent: 'space-between', gap: Spacing.md },
  flexText: { flex: 1 },
  splits: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.xs },
  splitPill: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  splitText: { fontWeight: '600' },
  memberItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderRadius: Radius.md,
    borderWidth: 1,
    padding: Spacing.md,
    gap: Spacing.md,
  },
  memberText: { flex: 1 },
  memberName: { fontWeight: '600' },
  roleBadge: { borderRadius: Radius.full, paddingHorizontal: Spacing.sm, paddingVertical: 3 },
  roleText: { fontWeight: '700' },
  pendingCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    borderRadius: Radius.lg,
    borderWidth: 1,
    padding: Spacing.md,
  },
  modal: { flex: 1, padding: Spacing.lg, gap: Spacing.lg },
  modalScroll: { gap: Spacing.md, paddingBottom: Spacing.xxl },
  formRow: { flexDirection: 'row', gap: Spacing.md },
  currencyInput: { width: 96 },
  formBlock: { gap: Spacing.sm },
  upperLabel: { textTransform: 'uppercase' },
  wrapRow: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.sm },
  choiceChip: { borderWidth: 1, borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  choiceText: { fontWeight: '700' },
  segmentedControl: { flexDirection: 'row', gap: Spacing.sm },
  segment: { flex: 1, alignItems: 'center', borderWidth: 1, borderRadius: Radius.full, paddingVertical: Spacing.sm },
  splitMemberRow: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.sm, gap: Spacing.sm },
  splitMemberName: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  checkbox: { width: 28, height: 28, borderRadius: Radius.sm, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center' },
  splitValueInput: { marginLeft: 36 },
  splitIndicator: { fontWeight: '700' },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
})
