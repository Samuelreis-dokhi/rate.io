/* HELPERS DE FORMATAÇÃO */

export const formatDate = (d) =>
  new Date(d).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

export const formatMoney = (value, currency = 'BRL') => 
  new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: currency || 'BRL',
}).format(Number(value || 0))