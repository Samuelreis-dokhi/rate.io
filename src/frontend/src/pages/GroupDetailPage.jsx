import { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useAuth } from '../context/useAuth.jsx'
import MenuNav from '../components/MenuNav.jsx'
import {
  StatCard, PendingCard, ActivityItem, EmptyState,
  Toast, Modal, Accordion,
} from '../components/ui/index.jsx'
import { formatDate, formatMoney } from '../context/Format.jsx'
import { api } from '../services/api.js'
import './styles/shared.css'
import './styles/GroupDetailPage.css'

const SPLIT_TYPES = [
  { value: 'igual',       label: 'Igualmente' },
  { value: 'porcentagem', label: 'Porcentagem' },
  { value: 'exato',       label: 'Valor exato' },
]

const GroupDetailPage = () => {
  const { groupId } = useParams()
  const { user } = useAuth()
  const userId = String(user?._id || '')
  const navigate = useNavigate()

  // ── Estado de dados ──────────────────────────
  const [group, setGroup] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [activities, setActivities] = useState([])
  const [balance, setBalance] = useState(null)
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

  const showToast = (msg, kind = 'success') => setToast({ message: msg, kind })

  // ── Form de despesa ───────────────────────────
  const defaultForm = { description: '', amount: '', currency: 'BRL', splitType: 'igual', paidBy: userId }
  const [expenseForm, setExpenseForm] = useState(defaultForm)
  const [selectedMembers, setSelectedMembers] = useState([])
  const [splitValues, setSplitValues] = useState({})
  const [expenseLoading, setExpenseLoading] = useState(false)
  const [expenseError, setExpenseError] = useState('')

  // ── Carregamento ──────────────────────────────
  const load = useCallback(async () => {
    if (!groupId || !userId) return
    setLoading(true)
    try {
      // Busca todos os grupos e filtra o atual
      const allGroups = await api.getUserGroups(userId)
      const found = allGroups.find((g) => g._id === groupId)
      if (!found) { navigate('/groups'); return }
      setGroup(found)

      // Perfis dos membros
      const memberIds = found.members.map((m) => String(m.userId))
      const profileEntries = await Promise.all(
        memberIds.map(async (id) => {
          try { return [id, await api.getUserProfile(id)] }
          catch { return [id, { name: 'Membro', email: '' }] }
        })
      )
      const profiles = Object.fromEntries(profileEntries)
      setProfilesById(profiles)

      // Inicializa selectedMembers para o form de despesa
      setSelectedMembers(memberIds)
      setSplitValues(Object.fromEntries(memberIds.map((id) => [id, ''])))
      setExpenseForm((c) => ({
        ...c,
        paidBy: memberIds.includes(userId) ? userId : memberIds[0] || '',
      }))

      // Dados paralelos
      const [expRes, actRes, balRes] = await Promise.all([
        api.getGroupExpenses(groupId, userId),
        api.getGroupActivities(groupId, userId),
        api.getGroupBalance(groupId, userId),
      ])

      setExpenses(expRes.expenses || expRes)
      setActivities(actRes)
      setBalance(balRes.balance || balRes)
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

  // Pendências do usuário neste grupo
  const myPendingPayments = useMemo(() =>
    expenses
      .filter((e) => {
        const mine = e.splits?.find((s) => String(s.userId) === userId)
        return mine?.status === 'pendente'
      })
      .map((e) => {
        const mine = e.splits.find((s) => String(s.userId) === userId)
        return {
          expenseId: e._id,
          description: e.description,
          amount: Number(mine.amount || 0),
          currency: e.currency || 'BRL',
          paidToName: profilesById[String(e.paidBy)]?.name || 'Membro',
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

  // Indicadores de soma para o form
  const percentageTotal = useMemo(() => {
    if (expenseForm.splitType !== 'porcentagem') return null
    return selectedMembers.reduce((s, id) => s + Number(splitValues[id] || 0), 0)
  }, [expenseForm.splitType, selectedMembers, splitValues])

  const exactTotal = useMemo(() => {
    if (expenseForm.splitType !== 'exato') return null
    return selectedMembers.reduce((s, id) => s + Number(splitValues[id] || 0), 0)
  }, [expenseForm.splitType, selectedMembers, splitValues])

  // ── Handlers ─────────────────────────────────
  const handleSettle = async (expenseId) => {
    try {
      await api.settleExpenseShare(expenseId, userId)
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

  const buildSplitsData = () => {
    if (expenseForm.splitType === 'igual')
      return selectedMembers.map((id) => ({ userId: id }))
    if (expenseForm.splitType === 'porcentagem')
      return selectedMembers.map((id) => ({ userId: id, percentage: Number(splitValues[id] || 0) }))
    return selectedMembers.map((id) => ({ userId: id, amount: Number(splitValues[id] || 0) }))
  }

  const handleCreateExpense = async (e) => {
    e.preventDefault()
    if (selectedMembers.length === 0) { setExpenseError('Selecione ao menos um membro.'); return }
    if (expenseForm.splitType === 'porcentagem' && Math.abs(percentageTotal - 100) > 0.01) {
      setExpenseError(`As porcentagens devem somar 100%. Atual: ${percentageTotal.toFixed(1)}%`)
      return
    }
    if (expenseForm.splitType === 'exato') {
      const total = Number(expenseForm.amount)
      if (Math.abs(exactTotal - total) > 0.01) {
        setExpenseError(`Os valores devem somar ${formatMoney(total)}. Atual: ${formatMoney(exactTotal)}`)
        return
      }
    }
    setExpenseLoading(true)
    setExpenseError('')
    try {
      await api.createExpense({
        groupId,
        description: expenseForm.description,
        amount: Number(expenseForm.amount),
        currency: expenseForm.currency,
        paidBy: expenseForm.paidBy || userId,
        createdBy: userId,
        splitType: expenseForm.splitType,
        splitsData: buildSplitsData(),
      })
      setExpenseForm(defaultForm)
      setShowExpenseModal(false)
      showToast('Despesa registrada com sucesso!')
      await load()
    } catch (err) {
      setExpenseError(err.message)
    } finally {
      setExpenseLoading(false)
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

  const netBalance = Number(balance?.netBalance || 0)
  const netTone = netBalance > 0.01 ? 'positive' : netBalance < -0.01 ? 'negative' : 'neutral'

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

        {/* 4 cards de saldo do grupo */}
        <div className='stats-grid'>
          <StatCard label='Pago' value={formatMoney(balance?.totalPaid || 0)} />
          <StatCard label='A receber' value={formatMoney(balance?.totalOwed || 0)} tone={balance?.totalOwed > 0 ? 'negative' : 'neutral'} />
          <StatCard label='Saldo líquido' value={formatMoney(netBalance)} tone={netTone} />
          <StatCard label='Membros' value={group.members.length} />
        </div>

        {/* Layout de duas colunas */}
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
                <EmptyState icon='💸' message='Nenhuma despesa ainda.' action={
                  <button className='btn btn-outline btn-small' onClick={() => setShowExpenseModal(true)} type='button'>
                    Registrar primeira despesa
                  </button>
                } />
              ) : (
                <div className='expense-list'>
                  {expenses.map((exp) => {
                    const paidByName = profilesById[String(exp.paidBy)]?.name || 'Membro'
                    const createdByName = profilesById[String(exp.createdBy)]?.name || 'Membro'
                    const mine = exp.splits?.find((s) => String(s.userId) === userId)
                    return (
                      <div key={exp._id} className='expense-card'>
                        <div className='expense-card__header'>
                          <div>
                            <p className='expense-card__name'>{exp.description}</p>
                            <p className='expense-card__meta'>
                              Pago por <strong>{paidByName}</strong> · criado por {createdByName}
                              · {exp.splitType} · {formatDate(exp.createdAt)}
                            </p>
                          </div>
                          <span className='expense-card__total'>
                            {formatMoney(exp.amount, exp.currency)}
                          </span>
                        </div>
                        <div className='expense-card__splits'>
                          {exp.splits?.map((s) => {
                            const name = profilesById[String(s.userId)]?.name || 'Membro'
                            return (
                              <span
                                key={String(s.userId)}
                                className={`split-pill ${s.status === 'pago' ? 'split-pill--paid' : 'split-pill--pending'}`}
                              >
                                {name}: {formatMoney(s.amount, exp.currency)}
                                {s.status === 'pago' ? ' ✓' : ''}
                              </span>
                            )
                          })}
                        </div>
                        {mine?.status === 'pendente' ? (
                          <div className='expense-card__action'>
                            <button
                              className='btn btn-small btn-outline'
                              onClick={() => handleSettle(exp._id)}
                              type='button'
                            >
                              Registrar meu pagamento ({formatMoney(mine.amount, exp.currency)})
                            </button>
                          </div>
                        ) : null}
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Atividades do grupo */}
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

          {/* Coluna lateral */}
          <div className='detail-sidebar'>
            {/* Membros — sanfona */}
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

            {/* O que preciso pagar */}
            <div className='section-block' style={{ marginTop: 20 }}>
              <div className='section-block__title'>
                Meus pagamentos pendentes
                {myPendingPayments.length > 0 && (
                  <span className='section-block__title-count'>{myPendingPayments.length}</span>
                )}
              </div>
              {myPendingPayments.length === 0 ? (
                <EmptyState icon='✅' message='Tudo pago!' />
              ) : (
                <div className='pending-list'>
                  {myPendingPayments.map((item) => (
                    <PendingCard
                      key={item.expenseId}
                      title={item.description}
                      meta={`Para ${item.paidToName} · ${formatDate(item.date)}`}
                      amount={item.amount}
                      currency={item.currency}
                      tone='negative'
                      action={
                        <button
                          className='btn btn-small btn-outline'
                          onClick={() => handleSettle(item.expenseId)}
                          type='button'
                        >
                          Pagar
                        </button>
                      }
                    />
                  ))}
                </div>
              )}
            </div>

            {/* O que vou receber */}
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

      {/* Modal: convidar membro */}
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

      {/* Modal: confirmar exclusão */}
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

      {/* Modal: nova despesa */}
      <Modal
        open={showExpenseModal}
        onClose={() => { setShowExpenseModal(false); setExpenseError('') }}
        title={`Nova despesa em ${group.name}`}
        size='lg'
      >
        <form className='modal-form' onSubmit={handleCreateExpense}>
          <label htmlFor='exp-desc'>Descrição *</label>
          <input
            id='exp-desc'
            type='text'
            placeholder='Ex: Jantar no restaurante'
            value={expenseForm.description}
            onChange={(e) => setExpenseForm((c) => ({ ...c, description: e.target.value }))}
            required
          />

          <label>Valor *</label>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 10 }}>
            <input
              type='number' min='0.01' step='0.01' placeholder='0,00'
              value={expenseForm.amount}
              onChange={(e) => setExpenseForm((c) => ({ ...c, amount: e.target.value }))}
              required
            />
            <input
              type='text' maxLength={3} placeholder='BRL'
              value={expenseForm.currency}
              onChange={(e) => setExpenseForm((c) => ({ ...c, currency: e.target.value.toUpperCase() }))}
            />
          </div>

          <label htmlFor='exp-paid'>Pago por *</label>
          <select
            id='exp-paid'
            value={expenseForm.paidBy}
            onChange={(e) => setExpenseForm((c) => ({ ...c, paidBy: e.target.value }))}
          >
            {members.map((m) => (
              <option key={m.userId} value={m.userId}>{m.name}</option>
            ))}
          </select>

          <label>Tipo de divisão</label>
          <div className='split-tabs'>
            {SPLIT_TYPES.map(({ value, label }) => (
              <button
                key={value}
                type='button'
                className={expenseForm.splitType === value ? 'split-tab split-tab--active' : 'split-tab'}
                onClick={() => setExpenseForm((c) => ({ ...c, splitType: value }))}
              >
                {label}
              </button>
            ))}
          </div>

          <label>Dividir entre</label>
          <div className='members-split'>
            {members.map((m) => {
              const checked = selectedMembers.includes(m.userId)
              return (
                <label key={m.userId} className='member-split-row'>
                  <input
                    type='checkbox' checked={checked}
                    onChange={(e) => {
                      if (e.target.checked) setSelectedMembers((c) => [...c, m.userId])
                      else setSelectedMembers((c) => c.filter((id) => id !== m.userId))
                    }}
                  />
                  <span>{m.name}</span>
                  {expenseForm.splitType !== 'igual' && checked ? (
                    <input
                      type='number' min='0' step='0.01'
                      placeholder={expenseForm.splitType === 'porcentagem' ? '%' : 'R$'}
                      value={splitValues[m.userId] || ''}
                      onChange={(e) => setSplitValues((c) => ({ ...c, [m.userId]: e.target.value }))}
                      className='split-value-input'
                    />
                  ) : (
                    expenseForm.splitType === 'igual' && checked && expenseForm.amount && selectedMembers.length > 0 ? (
                      <span className='split-preview'>
                        {formatMoney(Number(expenseForm.amount) / selectedMembers.length, expenseForm.currency)}
                      </span>
                    ) : null
                  )}
                </label>
              )
            })}
          </div>

          {/* Indicador de soma */}
          {percentageTotal !== null ? (
            <p className={`split-indicator ${Math.abs(percentageTotal - 100) <= 0.01 ? 'split-indicator--ok' : 'split-indicator--err'}`}>
              Total: {percentageTotal.toFixed(1)}%
              {Math.abs(percentageTotal - 100) <= 0.01 ? ' ✓' : ` (faltam ${(100 - percentageTotal).toFixed(1)}%)`}
            </p>
          ) : null}
          {exactTotal !== null && expenseForm.amount ? (
            <p className={`split-indicator ${Math.abs(exactTotal - Number(expenseForm.amount)) <= 0.01 ? 'split-indicator--ok' : 'split-indicator--err'}`}>
              Soma: {formatMoney(exactTotal, expenseForm.currency)} / {formatMoney(expenseForm.amount, expenseForm.currency)}
              {Math.abs(exactTotal - Number(expenseForm.amount)) <= 0.01 ? ' ✓' : ''}
            </p>
          ) : null}

          {expenseError ? (
            <p style={{ color: '#c81f1f', fontSize: '0.88rem' }}>{expenseError}</p>
          ) : null}

          <div className='modal-actions'>
            <button type='button' className='btn btn-ghost' onClick={() => { setShowExpenseModal(false); setExpenseError('') }}>
              Cancelar
            </button>
            <button type='submit' className='btn btn-primary' disabled={expenseLoading || selectedMembers.length === 0}>
              {expenseLoading ? 'Registrando...' : 'Registrar despesa'}
            </button>
          </div>
        </form>
      </Modal>

      <Toast message={toast.message} kind={toast.kind} onClose={() => setToast({ message: '', kind: 'success' })} />
    </div>
  )
}

export default GroupDetailPage