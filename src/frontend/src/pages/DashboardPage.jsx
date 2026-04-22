// src/frontend/src/pages/DashboardPage.jsx
import { useCallback, useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'
import MenuNav from '../components/MenuNav.jsx'
import { StatCard, PendingCard, EmptyState, Toast } from '../components/ui/index.jsx'
import { formatMoney } from '../context/Format.jsx'
import { api } from '../services/api.js'
import './styles/shared.css'
import './styles/DashboardPage.css'

const DashboardPage = () => {
  const { user } = useAuth()
  const userId = String(user?._id || user?.id || '')

  const [groups, setGroups] = useState([])
  const [profilesById, setProfilesById] = useState({})
  const [groupExpensesMap, setGroupExpensesMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState({ message: '', kind: 'success' })
  const [error, setError] = useState('')

  const showToast = (message, kind = 'success') => setToast({ message, kind })

  const load = useCallback(async () => {
    if (!userId) {
      console.warn('Usuário logado, mas ID não encontrado no objeto:', user)
      setLoading(false)
      return
    }
    setLoading(true)
    setError('')
    try {
      const groupsData = await api.getUserGroups(userId)
      setGroups(groupsData)

      // Perfis dos membros
      const memberIds = [...new Set(
        groupsData.flatMap((g) => g.members.map((m) => String(m.userId)))
      )]
      const profileEntries = await Promise.all(
        memberIds.map(async (id) => {
          try { return [id, await api.getUserProfile(id)] }
          catch { return [id, { name: 'Membro', email: '' }] }
        })
      )
      setProfilesById(Object.fromEntries(profileEntries))

      // Despesas de cada grupo
      const expenseEntries = await Promise.all(
        groupsData.map(async (g) => {
          try {
            const res = await api.getGroupExpenses(g._id, userId)
            return [g._id, res.expenses || res]
          } catch { return [g._id, []] }
        })
      )
      setGroupExpensesMap(Object.fromEntries(expenseEntries))
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }, [userId, user])

  useEffect(() => { load() }, [load])

  // Estatísticas globais
  const stats = useMemo(() => {
    let totalOwed = 0, totalToReceive = 0, unsettled = 0
    for (const list of Object.values(groupExpensesMap)) {
      for (const expense of list) {
        const mine = expense.splits?.find((s) => String(s.userId) === userId)
        if (mine?.status === 'pendente') { totalOwed += Number(mine.amount || 0); unsettled++ }
        if (String(expense.paidBy) === userId) {
          for (const s of expense.splits || []) {
            if (String(s.userId) !== userId && s.status === 'pendente')
              totalToReceive += Number(s.amount || 0)
          }
        }
      }
    }
    return { totalOwed, totalToReceive, net: totalToReceive - totalOwed, groups: groups.length, unsettled }
  }, [groupExpensesMap, groups.length, userId])

  // O que preciso pagar
  const pendingPayments = useMemo(() => {
    const list = []
    for (const [gId, expList] of Object.entries(groupExpensesMap)) {
      const groupName = groups.find((g) => g._id === gId)?.name || 'Grupo'
      for (const exp of expList) {
        const mine = exp.splits?.find((s) => String(s.userId) === userId)
        if (mine?.status === 'pendente') {
          list.push({
            expenseId: exp._id, 
            groupId: gId, 
            groupName,
            description: exp.description,
            amount: Number(mine.amount || 0),
            currency: exp.currency || 'BRL',
            paidToName: profilesById[String(exp.paidBy)]?.name || 'Membro',
            paidById: String(exp.paidBy) // <-- AQUI: Garantindo que o ID de quem pagou seja salvo
          })
        }
      }
    }
    return list.sort((a, b) => b.amount - a.amount)
  }, [groupExpensesMap, groups, profilesById, userId])

  // O que vou receber
  const pendingReceivements = useMemo(() => {
    const list = []
    for (const [gId, expList] of Object.entries(groupExpensesMap)) {
      const groupName = groups.find((g) => g._id === gId)?.name || 'Grupo'
      for (const exp of expList) {
        if (String(exp.paidBy) !== userId) continue
        for (const s of exp.splits || []) {
          const sid = String(s.userId)
          if (sid === userId || s.status !== 'pendente') continue
          list.push({
            expenseId: exp._id, 
            groupId: gId, 
            groupName,
            description: exp.description,
            amount: Number(s.amount || 0),
            currency: exp.currency || 'BRL',
            fromName: profilesById[sid]?.name || 'Membro',
          })
        }
      }
    }
    return list.sort((a, b) => b.amount - a.amount)
  }, [groupExpensesMap, groups, profilesById, userId])

  // Função de Settle atualizada com paidById
  const handleSettle = async (expenseId, groupId, paidById) => {
    try {
      const payload = {
        userId: userId,
        paidBy: paidById
      };
      
      console.log("Enviando payload limpo:", payload);

      // Enviando como objeto para a API
      await api.settleExpenseShare(expenseId, payload)
      
      showToast('Pagamento registrado com sucesso!')
      
      // Atualiza a tela
      const res = await api.getGroupExpenses(groupId, userId)
      setGroupExpensesMap((c) => ({ ...c, [groupId]: res.expenses || res }))
    } catch (err) {
      showToast(err.response?.data?.message || err.message, 'error')
    }
  }

  const netTone = stats.net > 0.01 ? 'positive' : stats.net < -0.01 ? 'negative' : 'neutral'

  if (loading) {
    return (
      <div className='inner-page'>
        <MenuNav />
        <div className='inner-page-body content-wrap'>
          <p style={{ color: 'var(--text)', textAlign: 'center', paddingTop: 60 }}>
            Carregando painel...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className='inner-page'>
      <MenuNav />

      <div className='inner-page-body content-wrap'>
        {/* Cabeçalho */}
        <div className='page-header'>
          <div className='page-header__text'>
            <h1>Olá, {user?.name || 'Usuário'}!</h1>
            <p>Aqui está o seu resumo financeiro.</p>
          </div>
        </div>

        {/* 4 cards de estatística */}
        <div className='stats-grid'>
          <StatCard
            label='A pagar'
            value={formatMoney(stats.totalOwed)}
            tone={stats.totalOwed > 0 ? 'negative' : 'neutral'}
          />
          <StatCard
            label='A receber'
            value={formatMoney(stats.totalToReceive)}
            tone={stats.totalToReceive > 0 ? 'positive' : 'neutral'}
          />
          <StatCard
            label='Saldo líquido'
            value={formatMoney(stats.net)}
            tone={netTone}
          />
          <StatCard
            label='Grupos ativos'
            value={stats.groups}
          />
        </div>

        {/* Atalhos */}
        <div className='shortcuts-grid'>
          <Link to='/groups' className='shortcut-card'>
            <span className='shortcut-card__icon'>👥</span>
            <strong className='shortcut-card__title'>Meus Grupos</strong>
            <span className='shortcut-card__desc'>
              Crie e gerencie grupos de despesas compartilhadas.
            </span>
          </Link>
          <Link to='/activities' className='shortcut-card'>
            <span className='shortcut-card__icon'>📋</span>
            <strong className='shortcut-card__title'>Atividades</strong>
            <span className='shortcut-card__desc'>
              {stats.unsettled > 0
                ? `${stats.unsettled} pendência(s) em aberto`
                : 'Acompanhe tudo que acontece nos seus grupos.'}
            </span>
          </Link>
        </div>

        {/* O que preciso pagar */}
        <div className='section-block'>
          <div className='section-block__title'>
            O que você precisa pagar
            {pendingPayments.length > 0 && (
              <span className='section-block__title-count'>{pendingPayments.length}</span>
            )}
          </div>
          {pendingPayments.length === 0 ? (
            <EmptyState icon='🎉' message='Nenhum pagamento pendente. Tudo acertado!' />
          ) : (
            <div className='pending-list'>
              {pendingPayments.map((item) => (
                <PendingCard
                  key={item.expenseId}
                  title={item.description}
                  meta={`${item.groupName} · Pagar para ${item.paidToName}`}
                  amount={item.amount}
                  currency={item.currency}
                  tone='negative'
                  action={
                    <button
                      className='btn btn-small btn-outline'
                      // <-- AQUI: Passando o paidById no momento do clique
                      onClick={() => handleSettle(item.expenseId, item.groupId, item.paidById)} 
                      type='button'
                    >
                      Registrar pagamento
                    </button>
                  }
                />
              ))}
            </div>
          )}
        </div>

        {/* O que vou receber */}
        <div className='section-block'>
          <div className='section-block__title'>
            O que você vai receber
            {pendingReceivements.length > 0 && (
              <span className='section-block__title-count'>{pendingReceivements.length}</span>
            )}
          </div>
          {pendingReceivements.length === 0 ? (
            <EmptyState icon='💤' message='Nenhum recebimento pendente no momento.' />
          ) : (
            <div className='pending-list'>
              {pendingReceivements.map((item) => (
                <PendingCard
                  key={`${item.expenseId}-${item.fromName}`}
                  title={item.description}
                  meta={`${item.groupName} · Receber de ${item.fromName}`}
                  amount={item.amount}
                  currency={item.currency}
                  tone='positive'
                />
              ))}
            </div>
          )}
        </div>

        {error ? <p style={{ color: '#c81f1f', textAlign: 'center', marginTop: 16 }}>{error}</p> : null}
      </div>

      <Toast message={toast.message} kind={toast.kind} onClose={() => setToast({ message: '', kind: 'success' })} />
    </div>
  )
}

export default DashboardPage