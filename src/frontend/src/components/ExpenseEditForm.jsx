import { useState, useMemo } from 'react'
import { Modal } from './ui/index.jsx'
import { formatMoney } from '../context/Format.jsx'

const SPLIT_TYPES = [
  { value: 'igual', label: 'Igualmente' },
  { value: 'porcentagem', label: 'Porcentagem' },
  { value: 'exato', label: 'Valor exato' },
]

const ExpenseEditForm = ({ 
  expense, 
  members, 
  open, 
  onClose, 
  onSubmit,
  isLoading = false 
}) => {
  const [form, setForm] = useState(expense ? {
    description: expense.description,
    amount: String(expense.amount),
    currency: expense.currency,
    splitType: expense.splitType,
    paidBy: String(expense.paidBy),
  } : {})

  // Inicializar membros divididos baseado nos splits existentes
  const [selectedMembers, setSelectedMembers] = useState(
    expense ? expense.splits.map((s) => s.userId.toString()) : members.map(m => m.userId)
  )
  
  // Inicializar valores de divisão
  const [splitValues, setSplitValues] = useState(
    expense 
      ? Object.fromEntries(
          expense.splits.map((split) => {
            if (expense.splitType === 'porcentagem') {
              const percentage = (split.amount / expense.amount) * 100
              return [split.userId.toString(), String(percentage.toFixed(2))]
            }
            return [split.userId.toString(), String(split.amount)]
          })
        )
      : Object.fromEntries(members.map((m) => [m.userId, '']))
  )

  const [error, setError] = useState('')

  const percentageTotal = useMemo(() => {
    if (form.splitType !== 'porcentagem') return null
    return selectedMembers.reduce((s, id) => s + Number(splitValues[id] || 0), 0)
  }, [form.splitType, selectedMembers, splitValues])

  const exactTotal = useMemo(() => {
    if (form.splitType !== 'exato') return null
    return selectedMembers.reduce((s, id) => s + Number(splitValues[id] || 0), 0)
  }, [form.splitType, selectedMembers, splitValues])

  const buildSplitsData = () => {
    if (form.splitType === 'igual')
      return selectedMembers.map((id) => ({ userId: id }))
    if (form.splitType === 'porcentagem')
      return selectedMembers.map((id) => ({ userId: id, percentage: Number(splitValues[id] || 0) }))
    return selectedMembers.map((id) => ({ userId: id, amount: Number(splitValues[id] || 0) }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    
    if (!form.description.trim()) {
      setError('Descrição é obrigatória')
      return
    }
    
    if (!form.amount || Number(form.amount) <= 0) {
      setError('Valor deve ser maior que 0')
      return
    }

    if (selectedMembers.length === 0) {
      setError('Selecione ao menos um membro.')
      return
    }
    
    if (form.splitType === 'porcentagem' && Math.abs(percentageTotal - 100) > 0.01) {
      setError(`As porcentagens devem somar 100%. Atual: ${percentageTotal.toFixed(1)}%`)
      return
    }
    
    if (form.splitType === 'exato') {
      const total = Number(form.amount)
      if (Math.abs(exactTotal - total) > 0.01) {
        setError(`Os valores devem somar ${formatMoney(total)}. Atual: ${formatMoney(exactTotal)}`)
        return
      }
    }

    setError('')
    onSubmit({
      description: form.description,
      amount: Number(form.amount),
      currency: form.currency,
      paidBy: form.paidBy,
      splitType: form.splitType,
      splitsData: buildSplitsData(),
    })
  }

  return (
    <Modal open={open} onClose={onClose} title='Editar Despesa' size='lg'>
      <form className='modal-form' onSubmit={handleSubmit}>
        <label htmlFor='edit-desc'>Descrição *</label>
        <input
          id='edit-desc'
          type='text'
          placeholder='Ex: Jantar no restaurante'
          value={form.description || ''}
          onChange={(e) => setForm((c) => ({ ...c, description: e.target.value }))}
          required
        />

        <label>Valor *</label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 90px', gap: 10 }}>
          <input
            type='number'
            min='0.01'
            step='0.01'
            placeholder='0,00'
            value={form.amount || ''}
            onChange={(e) => setForm((c) => ({ ...c, amount: e.target.value }))}
            required
          />
          <input
            type='text'
            maxLength={3}
            placeholder='BRL'
            value={form.currency || 'BRL'}
            onChange={(e) => setForm((c) => ({ ...c, currency: e.target.value.toUpperCase() }))}
          />
        </div>

        <label htmlFor='edit-paid'>Pago por *</label>
        <select
          id='edit-paid'
          value={form.paidBy || ''}
          onChange={(e) => setForm((c) => ({ ...c, paidBy: e.target.value }))}
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
              className={form.splitType === value ? 'split-tab split-tab--active' : 'split-tab'}
              onClick={() => setForm((c) => ({ ...c, splitType: value }))}
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
                  type='checkbox'
                  checked={checked}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedMembers((c) => [...c, m.userId])
                    else setSelectedMembers((c) => c.filter((id) => id !== m.userId))
                  }}
                />
                <span>{m.name}</span>
                {form.splitType !== 'igual' && checked ? (
                  <input
                    type='number'
                    min='0'
                    step='0.01'
                    placeholder={form.splitType === 'porcentagem' ? '%' : 'R$'}
                    value={splitValues[m.userId] || ''}
                    onChange={(e) => setSplitValues((c) => ({ ...c, [m.userId]: e.target.value }))}
                    className='split-value-input'
                  />
                ) : (
                  form.splitType === 'igual' && checked && form.amount && selectedMembers.length > 0 ? (
                    <span className='split-preview'>
                      {formatMoney(Number(form.amount) / selectedMembers.length, form.currency)}
                    </span>
                  ) : null
                )}
              </label>
            )
          })}
        </div>

        {percentageTotal !== null && (
          <p className={`split-indicator ${Math.abs(percentageTotal - 100) <= 0.01 ? 'split-indicator--ok' : 'split-indicator--err'}`}>
            Total: {percentageTotal.toFixed(1)}%
            {Math.abs(percentageTotal - 100) <= 0.01 ? ' ✓' : ` (faltam ${(100 - percentageTotal).toFixed(1)}%)`}
          </p>
        )}
        
        {exactTotal !== null && form.amount && (
          <p className={`split-indicator ${Math.abs(exactTotal - Number(form.amount)) <= 0.01 ? 'split-indicator--ok' : 'split-indicator--err'}`}>
            Soma: {formatMoney(exactTotal, form.currency)} / {formatMoney(form.amount, form.currency)}
            {Math.abs(exactTotal - Number(form.amount)) <= 0.01 ? ' ✓' : ''}
          </p>
        )}

        {error && (
          <p style={{ color: '#c81f1f', fontSize: '0.88rem' }}>{error}</p>
        )}

        <div className='modal-actions'>
          <button type='button' className='btn btn-ghost' onClick={onClose} disabled={isLoading}>
            Cancelar
          </button>
          <button type='submit' className='btn btn-primary' disabled={isLoading || selectedMembers.length === 0}>
            {isLoading ? 'Salvando...' : 'Salvar alterações'}
          </button>
        </div>
      </form>
    </Modal>
  )
}

export default ExpenseEditForm