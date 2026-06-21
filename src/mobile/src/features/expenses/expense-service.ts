// src/mobile/src/features/expenses/expense-service.ts
import { request } from '../../../services/api-client'

export interface ExpenseSplit {
  userId: string
  amount: number
  percentage?: number
  status: 'pendente' | 'pago'
  paidAt: string | null
}

export interface ExpenseAttachment {
  url: string
  name: string
  mimeType: string
  size: number
  uploadedAt: string
}

export interface Expense {
  _id: string
  groupId: string
  description: string
  amount: number
  currency: string
  paidBy: string
  createdBy: string
  splitType: string
  splits: ExpenseSplit[]
  createdAt: string
  attachment?: ExpenseAttachment | null
}

export interface GroupBalance {
  totalPaid: number
  totalOwed: number
  netBalance: number
  summary: { userId: string; amount: number }[]
}

// Resposta enveloped: { expenses: [] }
export async function getGroupExpenses(groupId: string, userId: string): Promise<Expense[]> {
  const data = await request<{ expenses: Expense[] }>(
    `/api/expenses/group/${groupId}?userId=${userId}`
  )
  return data.expenses ?? []
}

// Resposta enveloped: { balance: {} }
export async function getGroupBalance(groupId: string, userId: string): Promise<GroupBalance> {
  const data = await request<{ balance: GroupBalance }>(
    `/api/expenses/group/${groupId}/balances?userId=${userId}`
  )
  return data.balance
}

export function createExpense(payload: CreateExpensePayload): Promise<{ message: string; expense: Expense }>
export function createExpense(payload: FormData): Promise<{ message: string; expense: Expense }>
export function createExpense(payload: CreateExpensePayload | FormData) {
  if (payload instanceof FormData) {
    return request('/api/expenses', { method: 'POST', body: payload })
  }

  return request('/api/expenses', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function settleExpenseShare(expenseId: string, userId: string): Promise<{ message: string }> {
  return request(`/api/expenses/${expenseId}/settle`, {
    method: 'POST',
    body: JSON.stringify({ userId, paidBy: userId }), // backend exige ambos
  })
}

export function updateExpense(expenseId: string, payload: object): Promise<{ message: string; expense: Expense }>
export function updateExpense(expenseId: string, payload: FormData): Promise<{ message: string; expense: Expense }>
export function updateExpense(expenseId: string, payload: object | FormData) {
  if (payload instanceof FormData) {
    return request(`/api/expenses/${expenseId}`, { method: 'PUT', body: payload })
  }

  return request(`/api/expenses/${expenseId}`, { method: 'PUT', body: JSON.stringify(payload) })
}

export function deleteExpense(expenseId: string): Promise<{ message: string }> {
  return request(`/api/expenses/${expenseId}`, { method: 'DELETE' })
}

export interface CreateExpensePayload {
  groupId: string
  description: string
  amount: number
  currency: string
  paidBy: string
  createdBy: string
  splitType: string
  splitsData: object[]
  attachment?: {
    url: string
    name: string
    mimeType: string
    size: number
    uploadedAt: string
  } | null
}