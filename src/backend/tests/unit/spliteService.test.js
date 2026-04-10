const {
  calculateSplit,
  calculateEqualSplit,
  calculatePercentageSplit,
  validateExactSplit,
  isSupportedSplitType,
} = require('../../services/splitService');

describe('splitService', () => {
  // ─── isSupportedSplitType ───────────────────────────────────────────
  describe('isSupportedSplitType', () => {
    test('retorna true para tipos válidos', () => {
      expect(isSupportedSplitType('igual')).toBe(true);
      expect(isSupportedSplitType('porcentagem')).toBe(true);
      expect(isSupportedSplitType('exato')).toBe(true);
    });

    test('retorna false para tipo inválido', () => {
      expect(isSupportedSplitType('metade')).toBe(false);
      expect(isSupportedSplitType('')).toBe(false);
      expect(isSupportedSplitType(null)).toBe(false);
    });
  });

  // ─── calculateEqualSplit ────────────────────────────────────────────
  describe('calculateEqualSplit', () => {
    test('divide igualmente entre 3 pessoas', () => {
      const splits = [{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }];
      const result = calculateEqualSplit(90, splits);
      expect(result).toHaveLength(3);
      result.forEach((s) => expect(s.amount).toBe(30));
    });

    test('arredonda para 2 casas decimais', () => {
      const splits = [{ userId: 'a' }, { userId: 'b' }, { userId: 'c' }];
      const result = calculateEqualSplit(10, splits);
      // 10 / 3 = 3.333... → deve ser 3.33
      result.forEach((s) => expect(s.amount).toBe(3.33));
    });

    test('lança erro quando não há membros', () => {
      expect(() => calculateEqualSplit(100, [])).toThrow('Não há membros para dividir a despesa');
    });

    test('funciona com apenas 1 membro', () => {
      const result = calculateEqualSplit(50, [{ userId: 'a' }]);
      expect(result[0].amount).toBe(50);
    });

    test('preserva outros campos do split', () => {
      const splits = [{ userId: 'a', extra: 'dado' }];
      const result = calculateEqualSplit(100, splits);
      expect(result[0].extra).toBe('dado');
      expect(result[0].userId).toBe('a');
    });
  });

  // ─── calculatePercentageSplit ───────────────────────────────────────
  describe('calculatePercentageSplit', () => {
    test('calcula corretamente com porcentagens válidas', () => {
      const splits = [
        { userId: 'a', percentage: 60 },
        { userId: 'b', percentage: 40 },
      ];
      const result = calculatePercentageSplit(200, splits);
      expect(result[0].amount).toBe(120);
      expect(result[1].amount).toBe(80);
    });

    test('lança erro quando soma das porcentagens != 100', () => {
      const splits = [
        { userId: 'a', percentage: 60 },
        { userId: 'b', percentage: 30 },
      ];
      expect(() => calculatePercentageSplit(100, splits)).toThrow(
        'A soma das porcentagens deve ser 100%'
      );
    });

    test('aceita tolerância de 0.01% na soma', () => {
      // 33.33 + 33.33 + 33.34 = 100.00 (válido)
      const splits = [
        { userId: 'a', percentage: 33.33 },
        { userId: 'b', percentage: 33.33 },
        { userId: 'c', percentage: 33.34 },
      ];
      expect(() => calculatePercentageSplit(100, splits)).not.toThrow();
    });

    test('arredonda o valor resultante para 2 casas decimais', () => {
      const splits = [
        { userId: 'a', percentage: 33.33 },
        { userId: 'b', percentage: 33.33 },
        { userId: 'c', percentage: 33.34 },
      ];
      const result = calculatePercentageSplit(100, splits);
      result.forEach((s) => {
        expect(Number(s.amount.toFixed(2))).toBe(s.amount);
      });
    });
  });

  // ─── validateExactSplit ─────────────────────────────────────────────
  describe('validateExactSplit', () => {
    test('valida quando soma dos exatos é igual ao total', () => {
      const splits = [
        { userId: 'a', amount: 60 },
        { userId: 'b', amount: 40 },
      ];
      const result = validateExactSplit(100, splits);
      expect(result[0].amount).toBe(60);
      expect(result[1].amount).toBe(40);
    });

    test('lança erro quando soma difere do total', () => {
      const splits = [
        { userId: 'a', amount: 50 },
        { userId: 'b', amount: 30 },
      ];
      expect(() => validateExactSplit(100, splits)).toThrow(
        'A soma dos valores exatos deve ser igual ao total da despesa'
      );
    });

    test('aceita tolerância de 0.01 na soma', () => {
      const splits = [
        { userId: 'a', amount: 33.33 },
        { userId: 'b', amount: 33.33 },
        { userId: 'c', amount: 33.34 },
      ];
      expect(() => validateExactSplit(100, splits)).not.toThrow();
    });
  });

  // ─── calculateSplit (orquestrador) ──────────────────────────────────
  describe('calculateSplit', () => {
    test('delega para calculateEqualSplit quando tipo é "igual"', () => {
      const result = calculateSplit('igual', 60, [{ userId: 'a' }, { userId: 'b' }]);
      expect(result).toHaveLength(2);
      result.forEach((s) => expect(s.amount).toBe(30));
    });

    test('delega para calculatePercentageSplit quando tipo é "porcentagem"', () => {
      const result = calculateSplit('porcentagem', 100, [
        { userId: 'a', percentage: 70 },
        { userId: 'b', percentage: 30 },
      ]);
      expect(result[0].amount).toBe(70);
      expect(result[1].amount).toBe(30);
    });

    test('delega para validateExactSplit quando tipo é "exato"', () => {
      const result = calculateSplit('exato', 100, [
        { userId: 'a', amount: 80 },
        { userId: 'b', amount: 20 },
      ]);
      expect(result[0].amount).toBe(80);
    });

    test('lança erro para tipo não suportado', () => {
      expect(() => calculateSplit('metade', 100, [{ userId: 'a' }])).toThrow(
        'Tipo de divisão não suportado'
      );
    });

    test('lança erro para splitData vazio', () => {
      expect(() => calculateSplit('igual', 100, [])).toThrow(
        'Detalhes da divisão são obrigatórios'
      );
    });

    test('lança erro quando splitData não é array', () => {
      expect(() => calculateSplit('igual', 100, null)).toThrow();
    });

    test('lança erro para totalAmount <= 0', () => {
      expect(() => calculateSplit('igual', 0, [{ userId: 'a' }])).toThrow(
        'Valor total da despesa deve ser um número positivo'
      );
    });

    test('lança erro para totalAmount negativo', () => {
      expect(() => calculateSplit('igual', -50, [{ userId: 'a' }])).toThrow();
    });
  });
});
