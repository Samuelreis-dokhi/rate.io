// src/mobile/app/(app)/groups/index.tsx
import { useCallback, useEffect, useState } from 'react'
import { Alert, FlatList, Modal, RefreshControl, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native'
import { router } from 'expo-router'
import { useColorScheme } from '@/hooks/use-color-scheme'
import { Colors, Radius, Spacing, Typography } from '@/constants/theme'
import { useAuth } from '@/src/features/auth/auth-context'
import { createGroup, getUserGroups, type Group } from '@/src/features/groups/group-service'
import { EmptyState } from '@/components/ui/empty-state'
import { AppButton } from '@/components/ui/app-button'
import { AppInput } from '@/components/ui/app-input'
import { resolveUserId } from '@/src/utils/resolve-user-id'

export default function GroupListScreen() {
  const { user } = useAuth()
  const userId = resolveUserId(user as unknown as Record<string, unknown>)
  const scheme = useColorScheme()
  const c = Colors[scheme ?? 'light']

  const [groups, setGroups] = useState<Group[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [form, setForm] = useState({ name: '', description: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')

  const load = useCallback(async () => {
    if (!userId) {
      setLoading(false)
      setRefreshing(false)
      return
    }

    try {
      const data = await getUserGroups(userId)
      setGroups(data)
    } catch (err) {
      Alert.alert('Erro', (err as Error).message)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const handleCreate = async () => {
    if (!form.name.trim()) {
      setFormError('Nome obrigatório')
      return
    }

    if (!userId) {
      setFormError('Usuário não autenticado')
      return
    }

    setFormLoading(true)
    setFormError('')

    try {
      await createGroup({ name: form.name.trim(), description: form.description.trim(), createdBy: userId })
      setForm({ name: '', description: '' })
      setShowCreate(false)
      await load()
    } catch (err) {
      setFormError((err as Error).message)
    } finally {
      setFormLoading(false)
    }
  }

  const filtered = search.trim()
    ? groups.filter((g) => g.name.toLowerCase().includes(search.toLowerCase()))
    : groups

  const hasGroups = groups.length > 0
  const isSearching = search.trim().length > 0
  const noSearchResults = isSearching && hasGroups && filtered.length === 0

  return (
    <View style={[styles.root, { backgroundColor: c.canvas }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: c.canvas }]}>
        <Text style={[Typography.h1, { color: c.textPrimary }]}>Meus Grupos</Text>
        <TouchableOpacity
          style={[styles.addBtn, { backgroundColor: c.accentDeep }]}
          onPress={() => setShowCreate(true)}
        >
          <Text style={{ color: '#fff', fontWeight: '700' }}>+ Novo</Text>
        </TouchableOpacity>
      </View>

      {/* Busca */}
      <View style={{ padding: Spacing.lg, paddingTop: 0 }}>
        <TextInput
          style={[styles.search, { backgroundColor: c.surface, borderColor: c.border, color: c.textPrimary }]}
          placeholder='Buscar grupo...'
          placeholderTextColor={c.textSecondary}
          value={search}
          onChangeText={setSearch}
        />
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(item) => item._id}
        contentContainerStyle={{ padding: Spacing.lg, paddingTop: 0, gap: Spacing.md }}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); load() }} />}
        ListEmptyComponent={
          loading ? (
            <Text style={[Typography.body, { color: c.textSecondary, textAlign: 'center', paddingTop: 40 }]}>
              Carregando grupos...
            </Text>
          ) : noSearchResults ? (
            <EmptyState icon='🔎' message='Nenhum grupo encontrado para sua busca.' action={
              <AppButton title='Limpar busca' onPress={() => setSearch('')} />
            } />
          ) : (
            <EmptyState icon='👥' message='Você ainda não tem grupos. Crie o primeiro!' action={
              <AppButton title='Criar grupo' onPress={() => setShowCreate(true)} />
            } />
          )
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            style={[styles.card, { backgroundColor: c.surface, borderColor: c.border }]}
            onPress={() => router.push(`/(app)/groups/${item._id}`)}
          >
            <View style={styles.cardTop}>
              <Text style={[Typography.h2, { color: c.textPrimary, flex: 1 }]}>{item.name}</Text>
              <Text style={[Typography.caption, { color: c.accentDeep }]}>Abrir →</Text>
            </View>
            {item.description ? (
              <Text style={[Typography.body, { color: c.textSecondary }]}>{item.description}</Text>
            ) : null}
            <Text style={[Typography.caption, { color: c.textSecondary, marginTop: Spacing.xs }]}>
              {item.members.length} membro(s)
            </Text>
          </TouchableOpacity>
        )}
      />

      {/* Modal criar grupo */}
      <Modal visible={showCreate} animationType='slide' presentationStyle='pageSheet' onRequestClose={() => setShowCreate(false)}>
        <View style={[styles.modal, { backgroundColor: c.canvas }]}>
          <View style={styles.modalHeader}>
            <Text style={[Typography.h1, { color: c.textPrimary }]}>Novo grupo</Text>
            <TouchableOpacity onPress={() => { setShowCreate(false); setFormError('') }}>
              <Text style={[Typography.body, { color: c.accent }]}>Cancelar</Text>
            </TouchableOpacity>
          </View>
          <View style={{ gap: Spacing.md }}>
            <AppInput
              label='Nome *' placeholder='Ex: República PUC'
              value={form.name} onChangeText={(t: string) => setForm((c) => ({ ...c, name: t }))}
            />
            <AppInput
              label='Descrição' placeholder='Opcional'
              value={form.description} onChangeText={(t: string) => setForm((c) => ({ ...c, description: t }))}
            />
            {formError ? <Text style={{ color: '#c81f1f', ...Typography.body }}>{formError}</Text> : null}
            <AppButton title={formLoading ? 'Criando...' : 'Criar grupo'} onPress={handleCreate} loading={formLoading} disabled={formLoading} />
          </View>
        </View>
      </Modal>
    </View>
  )
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: Spacing.lg },
  addBtn: { borderRadius: Radius.full, paddingHorizontal: Spacing.md, paddingVertical: Spacing.sm },
  search: { borderRadius: Radius.md, borderWidth: 1, padding: Spacing.md, fontSize: 15 },
  card: { borderRadius: Radius.xl, borderWidth: 1, padding: Spacing.lg, gap: Spacing.xs },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' },
  modal: { flex: 1, padding: Spacing.lg, gap: Spacing.lg },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
})