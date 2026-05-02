import { useState } from 'react'
import { Modal } from './ui/index.jsx'
import { formatDate, formatMoney } from '../context/Format.jsx'

const ExpenseDetailModal = ({ 
  expense, 
  profilesById, 
  open, 
  onClose, 
  onEdit, 
  onDelete,
  isDeleting = false 
}) => {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  
  const paidByName = profilesById[String(expense.paidBy)]?.name || 'Membro'
  const createdByName = profilesById[String(expense.createdBy)]?.name || 'Membro'

  const handleDeleteClick = () => {
    onDelete(expense._id)
    setShowDeleteConfirm(false)
    onClose()
  }

  return (
    <>
      <Modal open={open} onClose={onClose} title='Detalhes da Despesa' size='lg'>
        <div style={{ padding: '20px 0' }}>
          {/* Descrição */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>
              Descrição
            </label>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-h)', margin: '8px 0 0 0' }}>
              {expense.description}
            </p>
          </div>

          {/* Valor e Moeda */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>
                Valor
              </label>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-h)', margin: '8px 0 0 0' }}>
                {formatMoney(expense.amount, expense.currency)}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>
                Moeda
              </label>
              <p style={{ fontSize: '1.1rem', color: 'var(--text-h)', margin: '8px 0 0 0' }}>
                {expense.currency}
              </p>
            </div>
          </div>

          {/* Pago por e Criado por */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>
                Pago por
              </label>
              <p style={{ fontSize: '1rem', color: 'var(--text-h)', margin: '8px 0 0 0' }}>
                {paidByName}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>
                Criado por
              </label>
              <p style={{ fontSize: '1rem', color: 'var(--text-h)', margin: '8px 0 0 0' }}>
                {createdByName}
              </p>
            </div>
          </div>

          {/* Tipo de Divisão e Data */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>
                Tipo de Divisão
              </label>
              <p style={{ fontSize: '1rem', color: 'var(--text-h)', margin: '8px 0 0 0', textTransform: 'capitalize' }}>
                {expense.splitType === 'igual' ? 'Igualmente' : 
                 expense.splitType === 'porcentagem' ? 'Porcentagem' : 'Valor exato'}
              </p>
            </div>
            <div>
              <label style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>
                Data
              </label>
              <p style={{ fontSize: '1rem', color: 'var(--text-h)', margin: '8px 0 0 0' }}>
                {formatDate(expense.createdAt)}
              </p>
            </div>
          </div>

          {/* Divisões */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: '0.85rem', color: 'var(--text)', fontWeight: 600 }}>
              Divisões
            </label>
            <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
              {expense.splits?.map((split) => {
                const name = profilesById[String(split.userId)]?.name || 'Membro'
                return (
                  <div 
                    key={String(split.userId)}
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      padding: '10px 12px',
                      background: 'var(--canvas)',
                      borderRadius: '8px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <span style={{ fontSize: '0.95rem', color: 'var(--text-h)' }}>
                      {name}
                    </span>
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <span style={{ fontSize: '0.95rem', color: 'var(--text-h)', fontWeight: 600 }}>
                        {formatMoney(split.amount, expense.currency)}
                      </span>
                      <span 
                        style={{
                          fontSize: '0.8rem',
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: split.status === 'pago' ? 'rgba(12, 124, 79, 0.1)' : 'rgba(200, 31, 31, 0.1)',
                          color: split.status === 'pago' ? '#0c7c4f' : '#c81f1f',
                          fontWeight: 600,
                        }}
                      >
                        {split.status === 'pago' ? 'Pago' : 'Pendente'}
                      </span>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Ações */}
          <div className='modal-actions'>
            <button type='button' className='btn btn-ghost' onClick={onClose}>
              Fechar
            </button>
            <button type='button' className='btn btn-outline' onClick={() => onEdit(expense)}>
              ✏️ Editar
            </button>
            <button 
              type='button' 
              className='btn btn-danger' 
              onClick={() => setShowDeleteConfirm(true)}
              disabled={isDeleting}
            >
              🗑️ Deletar
            </button>
          </div>
        </div>
      </Modal>

      {/* Modal de confirmação de deleção */}
      <Modal 
        open={showDeleteConfirm} 
        onClose={() => setShowDeleteConfirm(false)} 
        title='Deletar despesa?' 
        size='sm'
      >
        <p style={{ color: 'var(--text)', marginBottom: 24, lineHeight: 1.5 }}>
          Tem certeza que deseja deletar a despesa <strong>"{expense.description}"</strong>? Esta ação não pode ser desfeita.
        </p>
        <div className='modal-actions'>
          <button type='button' className='btn btn-ghost' onClick={() => setShowDeleteConfirm(false)}>
            Cancelar
          </button>
          <button 
            type='button' 
            className='btn btn-danger' 
            onClick={handleDeleteClick}
            disabled={isDeleting}
          >
            {isDeleting ? 'Deletando...' : 'Deletar'}
          </button>
        </div>
      </Modal>
    </>
  )
}

export default ExpenseDetailModal