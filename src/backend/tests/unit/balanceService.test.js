jest.mock('../../config/database', () => ({
  getConnections: jest.fn(() => ({
    models: {},
    model: jest.fn(() => ({ find: jest.fn() })),
  })),
}));

jest.mock('../../models/Expense', () => ({
  find: jest.fn(),
}));

const {
  getGroupBalances,
  getUserGroupBalance,
  getGroupPaymentGraph,
} = require('../../services/balanceService');

const Expense = require('../../models/Expense');

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

      expect(result['user_a'].balance).toBe(50);
      expect(result['user_b'].balance).toBe(-50);
    });

    test('ignora splits com status "pago"', async () => {
      Expense.find.mockResolvedValue([
        {
          paidBy: 'user_a',
          splits: [{ userId: 'user_b', amount: 50, status: 'pago' }],
        },
      ]);

      const result = await getGroupBalances('grupo123');

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

      expect(result.netBalance).toBe(100);
      expect(result.summary).toBe('100 a receber');
    });

    test('retorna summary "a pagar" quando saldo é negativo', async () => {
      Expense.find.mockResolvedValue([
        {
          paidBy: 'user_a',
          splits: [{ userId: 'user_b', amount: 100, status: 'pendente' }],
        },
      ]);

      const result = await getUserGroupBalance('user_b', 'grupo123');

      expect(result.netBalance).toBe(-100);
      expect(result.summary).toBe('100 a pagar');
    });

    test('retorna "Saldo equilibrado" quando saldo é zero', async () => {
      Expense.find.mockResolvedValue([]);

      const result = await getUserGroupBalance('user_a', 'grupo123');

      expect(result.netBalance).toBe(0);
      expect(result.summary).toBe('Saldo equilibrado');
    });

    test('retorna zeros para usuário sem movimentações no grupo', async () => {
      Expense.find.mockResolvedValue([]);

      const result = await getUserGroupBalance('user_inexistente', 'grupo123');

      expect(result.totalPaid).toBe(0);
      expect(result.totalOwed).toBe(0);
      expect(result.netBalance).toBe(0);
    });
  });

  describe('getGroupPaymentGraph', () => {
    test('retorna array vazio quando não há dívidas', async () => {
      Expense.find.mockResolvedValue([]);

      const result = await getGroupPaymentGraph('grupo123');

      expect(result).toEqual([]);
    });

    test('retorna array para qualquer grupo', async () => {
      Expense.find.mockResolvedValue([
        {
          paidBy: 'user_a',
          splits: [{ userId: 'user_b', amount: 60, status: 'pendente' }],
        },
      ]);

      const result = await getGroupPaymentGraph('grupo123');

      expect(Array.isArray(result)).toBe(true);
    });

    test('retorna array para múltiplas despesas', async () => {
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

      expect(Array.isArray(result)).toBe(true);
    });
  });
});