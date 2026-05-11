import { formatDate, formatMoney } from '../context/Format.jsx'

const ExpenseCard = ({ expense, userId, profilesById, onSettle, onViewDetails }) => {
  const paidByName = profilesById[String(expense.paidBy)]?.name || 'Membro'
  const createdByName = profilesById[String(expense.createdBy)]?.name || 'Membro'
  const mine = expense.splits?.find((s) => String(s.userId) === userId)

  return (
    <div className='expense-card'>
      <div className='expense-card__header'>
        <div style={{ cursor: 'pointer' }} onClick={() => onViewDetails(expense)}>
          <p className='expense-card__name'>{expense.description}</p>
          <p className='expense-card__meta'>
            Pago por <strong>{paidByName}</strong> · criado por {createdByName}
            · {expense.splitType} · {formatDate(expense.createdAt)}
          </p>
        </div>
        <span className='expense-card__total'>
          {formatMoney(expense.amount, expense.currency)}
        </span>
      </div>
      <div className='expense-card__splits'>
        {expense.splits?.map((s) => {
          const name = profilesById[String(s.userId)]?.name || 'Membro'
          return (
            <span
              key={String(s.userId)}
              className={`split-pill ${s.status === 'pago' ? 'split-pill--paid' : 'split-pill--pending'}`}
            >
              {name}: {formatMoney(s.amount, expense.currency)}
              {s.status === 'pago' ? ' ✓' : ''}
            </span>
          )
        })}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: 10, borderTop: '1px solid var(--border)' }}>
        {mine?.status === 'pendente' && (
          <button
            className='btn btn-small btn-outline'
            onClick={() => onSettle(expense._id, expense.paidBy)}
            type='button'
          >
            Registrar meu pagamento ({formatMoney(mine.amount, expense.currency)})
          </button>
        )}
        <button
          className='btn btn-small btn-outline'
          onClick={() => onViewDetails(expense)}
          type='button'
          style={{ marginLeft: 'auto' }}
        >
          ℹ️ Detalhes
        </button>
      </div>
    </div>
  )
}

export default ExpenseCard