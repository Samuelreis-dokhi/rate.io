import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'
import MenuNav from '../components/MenuNav.jsx'
import {
  StatCard, ActivityItem, EmptyState,
  Toast, Modal, Accordion, PendingCard,
} from '../components/ui/index.jsx'
import { formatDate, formatMoney } from '../context/Format.jsx'
import { api } from '../services/api.js'
import './styles/shared.css'
import './styles/GroupDetailPage.css'
import ExpenseCard from '../components/ExpenseCard'
import ExpenseForm from '../components/ExpenseForm'
import PendingPaymentsSection from '../components/PendingPaymentsSection'
import ExpenseDetailModal from '../components/ExpenseDetailModal'
import ExpenseEditForm from '../components/ExpenseEditForm'

const GroupDetailPage = () => {
  const { groupId } = useParams()
  const { user } = useAuth()
  const userId = String(user?._id || '')
  const navigate = useNavigate()

  // ── Estado de dados ──────────────────────────
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [activities, setActivities] = useState([])
<<<<<<< HEAD
=======
  const [balance, setBalance] = useState(null)
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
  const [profilesById, setProfilesById] = useState({})

  // ── Estado de UI ──────────────────────────────
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [showExpenseModal, setShowExpenseModal] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteLoading, setInviteLoading] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [toast, setToast] = useState({ message: '', kind: 'success' })
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [showEditModal, setShowEditModal] = useState(false)
  const [selectedExpense, setSelectedExpense] = useState(null)
  const [deleteExpenseLoading, setDeleteExpenseLoading] = useState(false)
  const [editExpenseLoading, setEditExpenseLoading] = useState(false)

  const showToast = (msg, kind = 'success') => setToast({ message: msg, kind })

  // ── Carregamento ──────────────────────────────
  const load = useCallback(async () => {
    if (!groupId || !userId) return
    setLoading(true)
    try {
      const allGroups = await api.getUserGroups(userId)
      const found = allGroups.find((g) => g._id === groupId)
      if (!found) { navigate('/groups'); return }
      setGroup(found)

      // Carrega perfis dos membros
      const memberIds = found.members.map((m) => String(m.userId))
      const profileEntries = await Promise.all(
        memberIds.map(async (id) => {
          try { return [id, await api.getUserProfile(id)] }
          catch { return [id, { name: 'Membro', email: '' }] }
        })
      )
      setProfilesById(Object.fromEntries(profileEntries))

      // Carrega dados paralelos
<<<<<<< HEAD
      const [expRes, actRes] = await Promise.all([
        api.getGroupExpenses(groupId, userId),
        api.getGroupActivities(groupId, userId),
=======
      const [expRes, actRes, balRes] = await Promise.all([
        api.getGroupExpenses(groupId, userId),
        api.getGroupActivities(groupId, userId),
        api.getGroupBalance(groupId, userId),
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
      ])

      setExpenses(expRes.expenses || expRes)
      setActivities(actRes)
<<<<<<< HEAD
=======
      setBalance(balRes.balance || balRes)
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setLoading(false)
    }
  }, [groupId, userId, navigate])

  useEffect(() => { load() }, [load])

  // ── Derivações ────────────────────────────────
  const members = useMemo(() => {
    if (!group) return []
    return group.members
      .map((m) => ({
        userId: String(m.userId),
        role: m.role,
        name: profilesById[String(m.userId)]?.name || 'Membro',
        email: profilesById[String(m.userId)]?.email || '',
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }, [group, profilesById])

  const isCreator = useMemo(
    () => Boolean(group && String(group.createdBy) === userId),
    [group, userId]
  )

  const hasPending = useMemo(
    () => expenses.some((e) => e.splits?.some((s) => s.status === 'pendente')),
    [expenses]
  )

  const myPendingPayments = useMemo(() =>
    expenses
      .filter((e) => e.splits?.find((s) => String(s.userId) === userId)?.status === 'pendente')
      .map((e) => {
        const mine = e.splits.find((s) => String(s.userId) === userId)
        return {
          expenseId: e._id,
          description: e.description,
          amount: Number(mine.amount || 0),
          currency: e.currency || 'BRL',
          paidToName: profilesById[String(e.paidBy)]?.name || 'Membro',
          paidBy: e.paidBy,  // ✅ Adicione isto
          date: e.createdAt,
        }
      }),
    [expenses, userId, profilesById]
  )

  const myPendingReceivements = useMemo(() => {
    const list = []
    for (const e of expenses) {
      if (String(e.paidBy) !== userId) continue
      for (const s of e.splits || []) {
        const sid = String(s.userId)
        if (sid === userId || s.status !== 'pendente') continue
        list.push({
          expenseId: e._id,
          description: e.description,
          amount: Number(s.amount || 0),
          currency: e.currency || 'BRL',
          fromName: profilesById[sid]?.name || 'Membro',
          date: e.createdAt,
        })
      }
    }
    return list
  }, [expenses, userId, profilesById])

<<<<<<< HEAD
  const groupStats = useMemo(() => {
    const totalToPay = myPendingPayments.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    )
    const totalToReceive = myPendingReceivements.reduce(
      (sum, item) => sum + Number(item.amount || 0),
      0
    )

    return {
      totalToPay,
      totalToReceive,
      net: totalToReceive - totalToPay,
      members: group?.members?.length || 0,
    }
  }, [group?.members?.length, myPendingPayments, myPendingReceivements])

=======
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
  // ── Handlers ─────────────────────────────────
  const handleSettle = async (expenseId, paidBy) => {
    try {
      await api.settleExpenseShare(expenseId, { userId, paidBy })
      showToast('Pagamento registrado!')
      await load()
    } catch (err) {
      showToast(err.message, 'error')
    }
  }

  const handleInvite = async (e) => {
    e.preventDefault()
    if (!inviteEmail.trim()) return
    setInviteLoading(true)
    try {
      await api.inviteToGroup(groupId, { email: inviteEmail, addedBy: userId })
      setInviteEmail('')
      setShowInvite(false)
      showToast('Membro adicionado com sucesso!')
      await load()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setInviteLoading(false)
    }
  }

  const handleDelete = async () => {
    setDeleteLoading(true)
    try {
      await api.deleteGroup(groupId, { userId })
      navigate('/groups')
    } catch (err) {
      setShowDeleteConfirm(false)
      showToast(err.message, 'error')
    } finally {
      setDeleteLoading(false)
    }
  }

  const handleCreateExpense = async (expenseData) => {
<<<<<<< HEAD
    await api.createExpense({
      groupId,
      ...expenseData,
      createdBy: userId,
    })
    showToast('Despesa registrada com sucesso!')
    setShowExpenseModal(false)
    await load()
=======
    try {
      await api.createExpense({
        groupId,
        ...expenseData,
        createdBy: userId,
      })
      showToast('Despesa registrada com sucesso!')
      setShowExpenseModal(false)
      await load()
    } catch (err) {
      throw err
    }
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
  }

  const handleViewDetails = (expense) => {
    setSelectedExpense(expense)
    setShowDetailModal(true)
  }

  const handleEditExpense = (expense) => {
    setSelectedExpense(expense)
    setShowDetailModal(false)
    setShowEditModal(true)
  }

  const handleUpdateExpense = async (updateData) => {
    setEditExpenseLoading(true)
    try {
      await api.updateExpense(selectedExpense._id, {
        ...updateData,
        updatedBy: userId,
      })
      showToast('Despesa atualizada com sucesso!')
      setShowEditModal(false)
      setSelectedExpense(null)
      await load()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setEditExpenseLoading(false)
    }
  }

  const handleDeleteExpense = async (expenseId) => {
    setDeleteExpenseLoading(true)
    try {
      await api.deleteExpense(expenseId, { userId })
      showToast('Despesa deletada com sucesso!')
      setShowDetailModal(false)
      setSelectedExpense(null)
      await load()
    } catch (err) {
      showToast(err.message, 'error')
    } finally {
      setDeleteExpenseLoading(false)
    }
  }

  // ── Render ────────────────────────────────────
  if (loading) {
    return (
      <div className='inner-page'>
        <MenuNav />
        <div className='inner-page-body content-wrap'>
          <p style={{ color: 'var(--text)', textAlign: 'center', paddingTop: 60 }}>
            Carregando grupo...
          </p>
        </div>
      </div>
    )
  }

  if (!group) return null

<<<<<<< HEAD
  const netTone = groupStats.net > 0.01 ? 'positive' : groupStats.net < -0.01 ? 'negative' : 'neutral'
=======
  const netBalance = Number(balance?.netBalance || 0)
  const netTone = netBalance > 0.01 ? 'positive' : netBalance < -0.01 ? 'negative' : 'neutral'
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028

  return (
    <div className='inner-page'>
      <MenuNav />

      <div className='inner-page-body content-wrap'>
        {/* Cabeçalho */}
        <div className='page-header'>
          <div className='page-header__text'>
            <button
              className='back-link'
              onClick={() => navigate('/groups')}
              type='button'
              aria-label='Voltar para grupos'
            >
              ← Grupos
            </button>
            <h1>{group.name}</h1>
            {group.description ? <p>{group.description}</p> : null}
          </div>
          <div className='page-header__actions'>
            <button
              className='btn btn-outline btn-small'
              onClick={() => setShowExpenseModal(true)}
              type='button'
            >
              + Nova despesa
            </button>
            <button
              className='btn btn-outline btn-small'
              onClick={() => setShowInvite(true)}
              type='button'
            >
              Convidar membro
            </button>
            {isCreator && !hasPending ? (
              <button
                className='btn btn-small btn-danger'
                onClick={() => setShowDeleteConfirm(true)}
                type='button'
              >
                Excluir grupo
              </button>
            ) : null}
          </div>
        </div>

        {/* Stats */}
        <div className='stats-grid'>
<<<<<<< HEAD
          <StatCard
            label='A pagar'
            value={formatMoney(groupStats.totalToPay)}
            tone={groupStats.totalToPay > 0 ? 'negative' : 'neutral'}
          />
          <StatCard
            label='A receber'
            value={formatMoney(groupStats.totalToReceive)}
            tone={groupStats.totalToReceive > 0 ? 'positive' : 'neutral'}
          />
          <StatCard
            label='Saldo líquido'
            value={formatMoney(groupStats.net)}
            tone={netTone}
          />
          <StatCard label='Membros' value={groupStats.members} />
=======
          <StatCard label='Pago' value={formatMoney(balance?.totalPaid || 0)} />
          <StatCard label='A receber' value={formatMoney(balance?.totalOwed || 0)} tone={balance?.totalOwed > 0 ? 'negative' : 'neutral'} />
          <StatCard label='Saldo líquido' value={formatMoney(netBalance)} tone={netTone} />
          <StatCard label='Membros' value={group.members.length} />
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
        </div>

        {/* Layout principal */}
        <div className='detail-grid'>
          {/* Coluna principal */}
          <div className='detail-main'>
            {/* Despesas */}
            <div className='section-block'>
              <div className='section-block__title'>
                Despesas
                <span className='section-block__title-count'>{expenses.length}</span>
              </div>
              {expenses.length === 0 ? (
                <EmptyState 
                  icon='💸' 
                  message='Nenhuma despesa ainda.' 
                  action={
                    <button 
                      className='btn btn-outline btn-small' 
                      onClick={() => setShowExpenseModal(true)} 
                      type='button'
                    >
                      Registrar primeira despesa
                    </button>
                  } 
                />
              ) : (
                <div className='expense-list'>
                  {expenses.map((exp) => (
                    <ExpenseCard
                      key={exp._id}
                      expense={exp}
                      userId={userId}
                      profilesById={profilesById}
                      onSettle={handleSettle}
                      onViewDetails={handleViewDetails}
                    />
                  ))}
                </div>
              )}
            </div>

            {/* Atividades */}
            <div className='section-block'>
              <div className='section-block__title'>
                Atividades
                <span className='section-block__title-count'>{activities.length}</span>
              </div>
              {activities.length === 0 ? (
                <EmptyState icon='📋' message='Nenhuma atividade registrada ainda.' />
              ) : (
                <div className='activity-list'>
                  {activities.slice(0, 10).map((act) => (
                    <ActivityItem key={act._id} activity={act} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className='detail-sidebar'>
            {/* Membros */}
            <Accordion title='Membros' count={members.length} defaultOpen>
              {members.map((m) => (
                <div key={m.userId} className='member-item'>
                  <div>
                    <p className='member-item__name'>{m.name}</p>
                    {m.email ? <p className='member-item__email'>{m.email}</p> : null}
                  </div>
                  <span className={`member-badge member-badge--${m.role}`}>
                    {m.role === 'admin' ? 'Admin' : 'Membro'}
                  </span>
                </div>
              ))}
            </Accordion>

            {/* Pagamentos pendentes */}
            <div className='section-block' style={{ marginTop: 20 }}>
              <div className='section-block__title'>
                Meus pagamentos pendentes
                {myPendingPayments.length > 0 && (
                  <span className='section-block__title-count'>{myPendingPayments.length}</span>
                )}
              </div>
              <PendingPaymentsSection 
                payments={myPendingPayments} 
                onSettle={handleSettle}
                emptyMessage='Tudo pago!'
              />
            </div>

            {/* Recebimentos pendentes */}
            <div className='section-block' style={{ marginTop: 20 }}>
              <div className='section-block__title'>
                Meus recebimentos pendentes
                {myPendingReceivements.length > 0 && (
                  <span className='section-block__title-count'>{myPendingReceivements.length}</span>
                )}
              </div>
              {myPendingReceivements.length === 0 ? (
                <EmptyState icon='💤' message='Nenhum recebimento pendente.' />
              ) : (
                <div className='pending-list'>
                  {myPendingReceivements.map((item) => (
                    <PendingCard
                      key={`${item.expenseId}-${item.fromName}`}
                      title={item.description}
                      meta={`De ${item.fromName} · ${formatDate(item.date)}`}
                      amount={item.amount}
                      currency={item.currency}
                      tone='positive'
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Convidar */}
      <Modal open={showInvite} onClose={() => setShowInvite(false)} title='Convidar membro' size='sm'>
        <form className='modal-form' onSubmit={handleInvite}>
          <label htmlFor='invite-email'>E-mail do membro</label>
          <input
            id='invite-email'
            type='email'
            placeholder='amigo@exemplo.com'
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            required
            autoFocus
          />
          <p style={{ fontSize: '0.82rem', color: 'var(--text)' }}>
            O usuário precisa já ter uma conta no RATE.IO.
          </p>
          <div className='modal-actions'>
            <button type='button' className='btn btn-ghost' onClick={() => setShowInvite(false)}>
              Cancelar
            </button>
            <button type='submit' className='btn btn-primary' disabled={inviteLoading}>
              {inviteLoading ? 'Adicionando...' : 'Convidar'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Modal: Deletar */}
      <Modal open={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title='Excluir grupo?' size='sm'>
        <p style={{ color: 'var(--text)', marginBottom: 24, lineHeight: 1.5 }}>
          Esta ação é irreversível. O grupo <strong>"{group.name}"</strong> será removido para todos os membros.
        </p>
        <div className='modal-actions'>
          <button type='button' className='btn btn-ghost' onClick={() => setShowDeleteConfirm(false)}>
            Cancelar
          </button>
          <button type='button' className='btn btn-danger' onClick={handleDelete} disabled={deleteLoading}>
            {deleteLoading ? 'Excluindo...' : 'Excluir grupo'}
          </button>
        </div>
      </Modal>

      {/* Modal: Nova despesa */}
      <Modal
        open={showExpenseModal}
        onClose={() => setShowExpenseModal(false)}
        title={`Nova despesa em ${group.name}`}
        size='lg'
      >
        <ExpenseForm
          members={members}
          onSubmit={handleCreateExpense}
          onClose={() => setShowExpenseModal(false)}
          paidByDefault={userId}
        />
      </Modal>

      {/* Modal: Detalhes da Despesa */}
      {selectedExpense && (
        <ExpenseDetailModal
          expense={selectedExpense}
          profilesById={profilesById}
          open={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onEdit={handleEditExpense}
          onDelete={handleDeleteExpense}
          isDeleting={deleteExpenseLoading}
        />
      )}

      {/* Modal: Editar Despesa */}
      {selectedExpense && (
        <ExpenseEditForm
          expense={selectedExpense}
          members={members}
          open={showEditModal}
          onClose={() => setShowEditModal(false)}
          onSubmit={handleUpdateExpense}
          isLoading={editExpenseLoading}
        />
      )}

      <Toast message={toast.message} kind={toast.kind} onClose={() => setToast({ message: '', kind: 'success' })} />
    </div>
  )
}

<<<<<<< HEAD
export default GroupDetailPage
=======
export default GroupDetailPage
>>>>>>> 47cbf17debdb7e3fee91ea831d37a42655ef2028
