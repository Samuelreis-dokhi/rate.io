/**
 * Componentes reutilizáveis do RATE.IO
 * Importe individualmente: import { StatCard, Toast } from '../components/ui'
 */

import { createPortal } from 'react-dom'
import { useEffect } from 'react'
import { formatDate, formatMoney } from '../../context/Format'

/**
 * StatsCard - Card de estatística numérica
 * Props: 
 *      - label, 
 *      - value, 
 *      - tone ('neutral'|'positive'|'negative')
 */

export const StatCard = ({ label, value, tone = 'neutral' }) => (
  <div className='stat-card'>
    <p className='stat-label'>{label}</p>
    <p className={`stat-value stat-value--${tone}`}>{value}</p>
  </div>
)

/**
 * PendingCard — item de pendência financeira
 * Props: 
 *      - title, 
 *      - meta, 
 *      - amount,
 *      - currency,
 *      - tone,
 *      - action (node opcional)
 */
export const PendingCard = ({ title, meta, amount, currency = 'BRL', tone = 'negative', action }) => (
  <div className='pending-card'>
    <div className='pending-card-info'>
      <span className='pending-card-title'>{title}</span>
      {meta ? <span className='pending-card-meta'>{meta}</span> : null}
    </div>
    <div className='pending-card-right'>
      <span className={`pending-card-amount pending-card-amount--${tone}`}>
        {formatMoney(amount, currency)}
      </span>
      {action || null}
    </div>
  </div>
)

/**
 * EmptyState — estado vazio
 * Props: 
 *      - icon, 
 *      - message, 
 *      - action (node opcional)
 */
export const EmptyState = ({ icon = '📭', message, action }) => (
  <div className='empty-state'>
    <span className='empty-state-icon'>{icon}</span>
    <p className='empty-state-message'>{message}</p>
    {action || null}
  </div>
)

/**
 * Toast — notificação flutuante (auto-remove)
 * Props: 
 *      - message, 
 *      - kind ('success'|'error'), 
 *      - onClose
 */
export const Toast = ({ message, kind = 'success', onClose }) => {
  useEffect(() => {
    if (!message) return
    const t = setTimeout(onClose, 3800)
    return () => clearTimeout(t)
  }, [message, onClose])

  if (!message) return null

  return createPortal(
    <div className={`toast toast--${kind}`} role={kind === 'error' ? 'alert' : 'status'} aria-live='polite'>
      <span>{kind === 'success' ? '✓' : '✕'}</span>
      {message}
    </div>,
    document.body,
  )
}

/**
 * Modal — portal com backdrop
 * Props: 
 *      - open, 
 *      - onClose, 
 *      - title,
 *      - children,
 *      - size ('sm'|'md'|'lg'),
 */
export const Modal = ({ open, onClose, title, children, size = 'md' }) => {
  useEffect(() => {
    if (!open) return
    const fn = (e) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', fn)
    return () => document.removeEventListener('keydown', fn)
  }, [open, onClose])

  if (!open) return null

  return createPortal(
    <div
      className='modal-backdrop'
      role='dialog'
      aria-modal='true'
      onClick={(e) => { if (e.target === e.currentTarget) onClose() }}
    >
      <div className={`modal-card modal-card--${size}`}>
        <div className='modal-header'>
          <h2 className='modal-title'>{title}</h2>
          <button className='modal-close' onClick={onClose} type='button' aria-label='Fechar'>✕</button>
        </div>
        <div className='modal-body'>{children}</div>
      </div>
    </div>,
    document.body,
  )
}

/**
 * ActivityItem — item do feed de atividades
 * Props: 
 *      - activity, 
 *      - groupName (opcional), 
 */
const ACTIVITY_ICONS = {
  GROUP_CREATED: '🎉',
  MEMBER_ADDED: '👋',
  EXPENSE_CREATED: '💸',
  PAYMENT_SETTLED: '✅',
  EXPENSE_UPDATED: '✏️',
  EXPENSE_DELETED: '❌',
  GROUP_DELETED: '🗑️',
}

export const ActivityItem = ({ activity, groupName }) => (
  <div className='activity-item'>
    <div className='activity-item-icon'>
      {ACTIVITY_ICONS[activity.type] || '📌'}
    </div>
    <div className='activity-item-body'>
      {groupName ? <span className='activity-item-group'>{groupName}</span> : null}
      <p className='activity-item-message'>{activity.message}</p>
      <span className='activity-item-date'>{formatDate(activity.createdAt)}</span>
    </div>
  </div>
)

// ─────────────────────────────────────────────
// Accordion — sanfona clicável
// Props: title, children, defaultOpen
// ─────────────────────────────────────────────
/**
 * Accordion — sanfona clicável
 * Props: 
 *      - title, 
 *      - children, 
 *      - defaultOpen,
 */
export const Accordion = ({ title, count, children, defaultOpen = false }) => {
  const [open, setOpen] = React.useState(defaultOpen)
  return (
    <div className={`accordion ${open ? 'accordion--open' : ''}`}>
      <button className='accordion-trigger' onClick={() => setOpen((v) => !v)} type='button'>
        <span>{title}</span>
        <span className='accordion-meta'>
          {count !== undefined ? <span className='accordion-count'>{count}</span> : null}
          <span className='accordion-chevron'>{open ? '▲' : '▼'}</span>
        </span>
      </button>
      {open ? <div className='accordion-body'>{children}</div> : null}
    </div>
  )
}

// Precisamos importar React para o Accordion
import React from 'react'