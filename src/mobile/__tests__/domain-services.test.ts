import {
  createExpense,
  deleteExpense,
  getGroupBalance,
  getGroupExpenses,
  settleExpenseShare,
} from '../src/features/expenses/expense-service'
import {
  createGroup,
  deleteGroup,
  getGroupActivities,
  getUserGroups,
  inviteToGroup,
} from '../src/features/groups/group-service'
import { request } from '../services/api-client'

jest.mock('../services/api-client', () => ({
  request: jest.fn(),
}))

const mockedRequest = request as jest.Mock

describe('domain services mobile', () => {
  beforeEach(() => {
    mockedRequest.mockReset()
  })

  it('desembrulha despesas retornadas pela API', async () => {
    mockedRequest.mockResolvedValueOnce({ expenses: [{ _id: 'expense-1' }] })

    await expect(getGroupExpenses('group-1', 'user-1')).resolves.toEqual([{ _id: 'expense-1' }])
    expect(mockedRequest).toHaveBeenCalledWith('/api/expenses/group/group-1?userId=user-1')
  })

  it('desembrulha saldo retornado pela API', async () => {
    mockedRequest.mockResolvedValueOnce({ balance: { netBalance: 60 } })

    await expect(getGroupBalance('group-1', 'user-1')).resolves.toEqual({ netBalance: 60 })
    expect(mockedRequest).toHaveBeenCalledWith('/api/expenses/group/group-1/balances?userId=user-1')
  })

  it('envia criacao, liquidacao e exclusao de despesa com payload correto', async () => {
    mockedRequest.mockResolvedValue({})
    const payload = {
      groupId: 'group-1',
      description: 'Hospedagem',
      amount: 120,
      currency: 'BRL',
      paidBy: 'user-1',
      createdBy: 'user-1',
      splitType: 'igual',
      splitsData: [{ userId: 'user-1' }, { userId: 'user-2' }],
    }

    await createExpense(payload)
    await settleExpenseShare('expense-1', 'user-2')
    await deleteExpense('expense-1', 'user-1')

    expect(mockedRequest).toHaveBeenNthCalledWith(1, '/api/expenses', {
      method: 'POST',
      body: JSON.stringify(payload),
    })
    expect(mockedRequest).toHaveBeenNthCalledWith(2, '/api/expenses/expense-1/settle', {
      method: 'POST',
      body: JSON.stringify({ userId: 'user-2', paidBy: 'user-2' }),
    })
    expect(mockedRequest).toHaveBeenNthCalledWith(3, '/api/expenses/expense-1', {
      method: 'DELETE',
      body: JSON.stringify({ userId: 'user-1' }),
    })
  })

  it('mapeia endpoints de grupos e atividades', async () => {
    mockedRequest.mockResolvedValue({})
    const groupPayload = { name: 'Viagem', createdBy: 'user-1', membersIds: ['user-2'] }
    const invitePayload = { email: 'bruno@teste.com', addedBy: 'user-1' }

    await getUserGroups('user-1')
    await createGroup(groupPayload)
    await inviteToGroup('group-1', invitePayload)
    await getGroupActivities('group-1', 'user-1', 10)
    await deleteGroup('group-1', 'user-1')

    expect(mockedRequest).toHaveBeenNthCalledWith(1, '/api/groups/user/user-1')
    expect(mockedRequest).toHaveBeenNthCalledWith(2, '/api/groups', {
      method: 'POST',
      body: JSON.stringify(groupPayload),
    })
    expect(mockedRequest).toHaveBeenNthCalledWith(3, '/api/groups/group-1/invite', {
      method: 'POST',
      body: JSON.stringify(invitePayload),
    })
    expect(mockedRequest).toHaveBeenNthCalledWith(
      4,
      '/api/groups/group-1/activities?userId=user-1&limit=10',
    )
    expect(mockedRequest).toHaveBeenNthCalledWith(5, '/api/groups/group-1', {
      method: 'DELETE',
      body: JSON.stringify({ userId: 'user-1' }),
    })
  })
})
