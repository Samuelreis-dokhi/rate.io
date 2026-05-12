export function formatMoney(value: number | string, currency = 'BRL'): string{
    return new Intl.NumberFormat('pt-BR', {
        style: 'currency',
        currency,
    }).format(Number(value || 0))
}

export function formatDate(value: string | Date | null): string{
    if(!value) return ''
    return new Intl.DateTimeFormat('pt-BR', {
        day:'2-digit',
        month:'2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(value))
}