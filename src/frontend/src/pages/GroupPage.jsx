import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'
import MenuNav from '../components/MenuNav.jsx'
import { StatCard, EmptyState, Toast, Modal } from '../components/ui/index.jsx'
import { formatMoney } from '../context/Format.jsx'
import { api } from '../services/api.js'
import './styles/shared.css'
import './styles/GroupPage.css'

const GroupPage = () => {
  const { user } = useAuth()
  const userId = String(user?._id || '')
  const navigate = useNavigate()

  const [groups, setGroups] = useState([])
  const [groupBalancesMap, setGroupBalancesMap] = useState({})
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [groupForm, setGroupForm] = useState({ name: '', description: '' })
  const [formLoading, setFormLoading] = useState(false)
  const [formError, setFormError] = useState('')
  const [toast, setToast] = useState({ message: '', kind: 'success' })

  const showToast = (message, kind = 'success') => setToast({ message, kind })

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const data = await api.getUserGroups(userId)
      setGroups(data)

      // Saldos de cada grupo para o badge
      const balanceEntries = await Promise.all(
        data.map(async (g) => {
          try {
            const res = await api.getGroupBalance(g._id, userId)
            return [g._id, res.balance || res]
          } catch { return [g._id, null] }
        })
      )
      setGroupBalancesMap(Object.fromEntries(balanceEntries))
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  const filteredGroups = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return groups
    return groups.filter((g) =>
      g.name.toLowerCase().includes(q) ||
      (g.description || '').toLowerCase().includes(q)
    )
  }, [groups, search])

  const handleCreate = async (e) => {
    e.preventDefault()
    if (!groupForm.name.trim()) return
    setFormLoading(true)
    setFormError('')
    try {
      await api.createGroup({ ...groupForm, createdBy: userId, membersIds: [] })
      setGroupForm({ name: '', description: '' })
      setShowCreate(false)
      showToast('Grupo criado com sucesso!')
      await load()
    } catch (err) {
      setFormError(err.message)
    } finally {
      setFormLoading(false)
    }
  }

  const getBalanceBadge = (groupId) => {
    const b = groupBalancesMap[groupId]
    if (!b) return null
    const net = Number(b.netBalance || 0)
    if (net > 0.01) return { label: `+${formatMoney(net)}`, cls: 'badge--positive' }
    if (net < -0.01) return { label: formatMoney(net), cls: 'badge--negative' }
    return { label: 'Acertado', cls: 'badge--neutral' }
  }

  return (
    <div className='inner-page'>
      <MenuNav />

      <div className='inner-page-body content-wrap'>
        {/* Cabeçalho */}
        <div className='page-header'>
          <div className='page-header__text'>
            <h1>Meus Grupos</h1>
            <p>Gerencie seus grupos de despesas compartilhadas.</p>
          </div>
          <div className='page-header__actions'>
            <button
              className='btn btn-primary'
              onClick={() => setShowCreate(true)}
              type='button'
            >
              + Novo grupo
            </button>
          </div>
        </div>

        {/* Barra de busca */}
        <div className='groups-toolbar'>
          <input
            type='text'
            className='search-input'
            placeholder='Buscar por nome ou descrição...'
            aria-label='Buscar grupo'
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <span className='groups-count'>
            {filteredGroups.length} / {groups.length} grupo(s)
          </span>
        </div>

        {/* Grid de grupos */}
        {loading ? (
          <p style={{ color: 'var(--text)', textAlign: 'center', paddingTop: 40 }}>
            Carregando grupos...
          </p>
        ) : groups.length === 0 ? (
          <EmptyState
            icon='👥'
            message='Você ainda não tem grupos. Crie o primeiro!'
            action={
              <button className='btn btn-primary' onClick={() => setShowCreate(true)} type='button'>
                Criar grupo
              </button>
            }
          />
        ) : filteredGroups.length === 0 ? (
          <EmptyState icon='🔍' message={`Nenhum grupo encontrado para "${search}".`} />
        ) : (
          <div className='groups-grid'>
            {filteredGroups.map((group) => {
              const badge = getBalanceBadge(group._id)
              return (
                <button
                  key={group._id}
                  className='group-card'
                  onClick={() => navigate(`/groups/${group._id}`)}
                  type='button'
                >
                  <div className='group-card__top'>
                    <p className='group-card__name'>{group.name}</p>
                    {badge ? (
                      <span className={`group-card__badge ${badge.cls}`}>{badge.label}</span>
                    ) : null}
                  </div>
                  <p className='group-card__desc'>
                    {group.description || 'Sem descrição.'}
                  </p>
                  <div className='group-card__footer'>
                    <span className='group-card__members'>
                      {group.members.length} membro(s)
                    </span>
                    <span className='group-card__cta'>Abrir →</span>
                  </div>
                </button>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal de criação */}
      <Modal
        open={showCreate}
        onClose={() => { setShowCreate(false); setFormError('') }}
        title='Criar novo grupo'
        size='sm'
      >
        <form className='modal-form' onSubmit={handleCreate}>
          <label htmlFor='gname'>Nome do grupo *</label>
          <input
            id='gname'
            type='text'
            placeholder='Ex: República PUC'
            value={groupForm.name}
            onChange={(e) => setGroupForm((c) => ({ ...c, name: e.target.value }))}
            required
            minLength={2}
            autoFocus
          />
          <label htmlFor='gdesc'>Descrição</label>
          <input
            id='gdesc'
            type='text'
            placeholder='Opcional'
            value={groupForm.description}
            onChange={(e) => setGroupForm((c) => ({ ...c, description: e.target.value }))}
          />
          {formError ? (
            <p style={{ color: '#c81f1f', fontSize: '0.88rem' }}>{formError}</p>
          ) : null}
          <div className='modal-actions'>
            <button
              type='button'
              className='btn btn-ghost'
              onClick={() => { setShowCreate(false); setFormError('') }}
            >
              Cancelar
            </button>
            <button type='submit' className='btn btn-primary' disabled={formLoading}>
              {formLoading ? 'Criando...' : 'Criar grupo'}
            </button>
          </div>
        </form>
      </Modal>

      <Toast
        message={toast.message}
        kind={toast.kind}
        onClose={() => setToast({ message: '', kind: 'success' })}
      />
    </div>
  )
}

export default GroupPage