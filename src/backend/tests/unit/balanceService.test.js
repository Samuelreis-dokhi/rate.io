const Expense = require('../../models/Expense');

const {
  getGroupBalances,
  getUserGroupBalance,
  getGroupPaymentGraph,
} = require('../../services/balanceService');

jest.mock('../../models/Expense', () => ({
  find: jest.fn(),
}));

describe('balanceService', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getGroupBalances', () => {
    test('calcula saldo correto quando um usuário paga pelo outro', async () => {
      Expense.find.mockResolvedValue([
        {
          paidBy: 'user_a',
          splits: [
            { userId: 'user_a', amount: 50, status: 'pendente' },
            { userId: 'user_b', amount: 50, status: 'pendente' },
          ],
        },
      ]);

      const result = await getGroupBalances('grupo123');

      expect(result['user_a']).toEqual({
        paid: 100,
        owed: 50,
        balance: 50,
      });

      expect(result['user_b']).toEqual({
        paid: 0,
        owed: 50,
        balance: -50,
      });
    });

    test('ignora splits com status "pago"', async () => {
      Expense.find.mockResolvedValue([
        {
          paidBy: 'user_a',
          splits: [{ userId: 'user_b', amount: 50, status: 'pago' }],
        },
      ]);

      const result = await getGroupBalances('grupo123');

      expect(result['user_a']).toEqual({
        paid: 0,
        owed: 0,
        balance: 0,
      });

      expect(result['user_b']).toBeUndefined();
    });

    test('retorna objeto vazio quando não há despesas', async () => {
      Expense.find.mockResolvedValue([]);

      const result = await getGroupBalances('grupo123');

      expect(result).toEqual({});
    });

    test('arredonda saldos para 2 casas decimais', async () => {
      Expense.find.mockResolvedValue([
        {
          paidBy: 'user_a',
          splits: [{ userId: 'user_b', amount: 33.3333, status: 'pendente' }],
        },
      ]);

      const result = await getGroupBalances('grupo123');

      expect(result['user_b'].balance).toBe(-33.33);
      expect(result['user_a'].balance).toBe(33.33);
    });

    test('acumula corretamente múltiplas despesas', async () => {
      Expense.find.mockResolvedValue([
        {
          paidBy: 'user_a',
          splits: [{ userId: 'user_b', amount: 30, status: 'pendente' }],
        },
        {
          paidBy: 'user_a',
          splits: [{ userId: 'user_b', amount: 20, status: 'pendente' }],
        },
      ]);

      const result = await getGroupBalances('grupo123');

      expect(result['user_a'].balance).toBe(50);
      expect(result['user_b'].balance).toBe(-50);
    });

    test('chama Expense.find com groupId', async () => {
      Expense.find.mockResolvedValue([]);

      await getGroupBalances('grupo_xyz');

      expect(Expense.find).toHaveBeenCalledWith({ groupId: 'grupo_xyz' });
    });
  });

  describe('getUserGroupBalance', () => {
    test('retorna summary "a receber" quando saldo é positivo', async () => {
      Expense.find.mockResolvedValue([
        {
          paidBy: 'user_a',
          splits: [{ userId: 'user_b', amount: 100, status: 'pendente' }],
        },
      ]);

      const result = await getUserGroupBalance('user_a', 'grupo123');

      expect(result).toEqual({
        totalPaid: 100,
        totalOwed: 0,
        netBalance: 100,
        summary: '100 a receber',
      });
    });

    test('retorna summary "a pagar" quando saldo é negativo', async () => {
      Expense.find.mockResolvedValue([
        {
          paidBy: 'user_a',
          splits: [{ userId: 'user_b', amount: 100, status: 'pendente' }],
        },
      ]);

      const result = await getUserGroupBalance('user_b', 'grupo123');

      expect(result).toEqual({
        totalPaid: 0,
        totalOwed: 100,
        netBalance: -100,
        summary: '100 a pagar',
      });
    });

    test('retorna "Saldo equilibrado" quando saldo é zero', async () => {
      Expense.find.mockResolvedValue([]);

      const result = await getUserGroupBalance('user_a', 'grupo123');

      expect(result).toEqual({
        totalPaid: 0,
        totalOwed: 0,
        netBalance: 0,
        summary: 'Saldo equilibrado',
      });
    });
  });

  describe('getGroupPaymentGraph', () => {
    test('retorna lista de pagamentos quando há credor e devedor', async () => {
      Expense.find.mockResolvedValue([
        {
          paidBy: 'user_a',
          splits: [{ userId: 'user_b', amount: 60, status: 'pendente' }],
        },
      ]);

      const result = await getGroupPaymentGraph('grupo123');

      expect(result).toEqual([
        {
          devedor: 'user_b',
          credor: 'user_a',
          valor: 60,
        },
      ]);
    });

    test('retorna lista de pagamentos para múltiplos credores', async () => {
      Expense.find.mockResolvedValue([
        {
          paidBy: 'user_a',
          splits: [{ userId: 'user_c', amount: 40, status: 'pendente' }],
        },
        {
          paidBy: 'user_b',
          splits: [{ userId: 'user_c', amount: 60, status: 'pendente' }],
        },
      ]);

      const result = await getGroupPaymentGraph('grupo123');

      expect(result).toEqual([
        {
          devedor: 'user_c',
          credor: 'user_a',
          valor: 40,
        },
        {
          devedor: 'user_c',
          credor: 'user_b',
          valor: 60,
        },
      ]);
    });

    test('retorna array vazio quando não há dívidas', async () => {
      Expense.find.mockResolvedValue([]);

      const result = await getGroupPaymentGraph('grupo123');

      expect(result).toEqual([]);
    });
  });
});
