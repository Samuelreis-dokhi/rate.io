import { PendingCard, EmptyState } from '../components/ui/index.jsx';
import { formatDate } from '../context/Format.jsx';

const PendingPaymentsSection = ({ payments, onSettle, emptyMessage = 'Tudo pago!' }) => {
  if (payments.length === 0) {
    return <EmptyState icon='✅' message={emptyMessage} />
  }

  return (
    <div className='pending-list'>
      {payments.map((item) => (
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
              onClick={() => onSettle(item.expenseId, item.paidBy)}
              type='button'
            >
              Pagar
            </button>
          }
        />
      ))}
    </div>
  )
}

export default PendingPaymentsSection