import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'
import MenuNav from '../components/MenuNav.jsx'
import { ActivityItem, EmptyState, Toast } from '../components/ui/index.jsx'
import { api } from '../services/api.js'
import './styles/shared.css'
import './styles/ActivityPage.css'

const PAGE_SIZE = 10

const ActivityPage = () => {
  const { user } = useAuth()
  const userId = String(user?._id || '')

  const [groups, setGroups] = useState([])
  const [activitiesMap, setActivitiesMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [filterGroup, setFilterGroup] = useState('all')
  const [filterType, setFilterType] = useState('all')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState({ message: '', kind: 'success' })

  const load = useCallback(async () => {
    if (!userId) return
    setLoading(true)
    try {
      const groupsData = await api.getUserGroups(userId)
      setGroups(groupsData)

      const activityEntries = await Promise.all(
        groupsData.map(async (g) => {
          try {
            const acts = await api.getGroupActivities(g._id, userId)
            return [g._id, acts]
          } catch { return [g._id, []] }
        })
      )
      setActivitiesMap(Object.fromEntries(activityEntries))
    } catch (err) {
      setToast({ message: err.message, kind: 'error' })
    } finally {
      setLoading(false)
    }
  }, [userId])

  useEffect(() => { load() }, [load])

  // Monta feed global ordenado por data
  const allActivities = useMemo(() => {
    const list = []
    for (const [gId, acts] of Object.entries(activitiesMap)) {
      const groupName = groups.find((g) => g._id === gId)?.name || 'Grupo'
      for (const act of acts) {
        list.push({ ...act, groupId: gId, groupName })
      }
    }
    return list.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }, [activitiesMap, groups])

  // Filtros
  const filtered = useMemo(() => {
    let list = allActivities
    if (filterGroup !== 'all') list = list.filter((a) => a.groupId === filterGroup)
    if (filterType !== 'all') list = list.filter((a) => a.type === filterType)
    return list
  }, [allActivities, filterGroup, filterType])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages)
  const paginated = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE)

  // Resetar página ao mudar filtros
  useEffect(() => { setPage(1) }, [filterGroup, filterType])

  const TYPE_LABELS = {
    all: 'Todos os tipos',
    GROUP_CREATED: 'Grupo criado',
    MEMBER_ADDED: 'Membro adicionado',
    EXPENSE_CREATED: 'Despesa registrada',
    PAYMENT_SETTLED: 'Pagamento quitado',
    GROUP_DELETED: 'Grupo excluído',
  }

  return (
    <div className='inner-page'>
      <MenuNav />

      <div className='inner-page-body content-wrap'>
        {/* Cabeçalho */}
        <div className='page-header'>
          <div className='page-header__text'>
            <h1>Atividades</h1>
            <p>Tudo que aconteceu nos seus grupos, em ordem cronológica.</p>
          </div>
        </div>

        {/* Filtros */}
        <div className='activity-filters'>
          <select
            className='activity-filter-select'
            value={filterGroup}
            onChange={(e) => setFilterGroup(e.target.value)}
            aria-label='Filtrar por grupo'
          >
            <option value='all'>Todos os grupos</option>
            {groups.map((g) => (
              <option key={g._id} value={g._id}>{g.name}</option>
            ))}
          </select>

          <select
            className='activity-filter-select'
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            aria-label='Filtrar por tipo'
          >
            {Object.entries(TYPE_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>

          <span className='activity-count'>
            {filtered.length} atividade(s)
          </span>
        </div>

        {/* Feed */}
        {loading ? (
          <p style={{ color: 'var(--text)', textAlign: 'center', paddingTop: 40 }}>
            Carregando atividades...
          </p>
        ) : filtered.length === 0 ? (
          <EmptyState
            icon='📋'
            message={allActivities.length === 0
              ? 'Nenhuma atividade ainda. Comece criando um grupo!'
              : 'Nenhuma atividade encontrada para este filtro.'}
            action={allActivities.length === 0 ? (
              <Link to='/groups' className='btn btn-primary'>Ir para grupos</Link>
            ) : null}
          />
        ) : (
          <>
            <div className='activity-list'>
              {paginated.map((act) => (
                <ActivityItem key={act._id} activity={act} groupName={act.groupName} />
              ))}
            </div>

            {/* Paginação */}
            {totalPages > 1 ? (
              <div className='activity-pagination'>
                <button
                  className='btn btn-ghost btn-small'
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={safePage === 1}
                  type='button'
                >
                  ← Anterior
                </button>
                <span className='activity-pagination__info'>
                  Página {safePage} de {totalPages}
                </span>
                <button
                  className='btn btn-ghost btn-small'
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={safePage === totalPages}
                  type='button'
                >
                  Próxima →
                </button>
              </div>
            ) : null}
          </>
        )}
      </div>

      <Toast
        message={toast.message}
        kind={toast.kind}
        onClose={() => setToast({ message: '', kind: 'success' })}
      />
    </div>
  )
}

export default ActivityPage