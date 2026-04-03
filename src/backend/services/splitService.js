/**
 * splitService.js irá lidar com a lógica de negócios relacionada à divisão de despesas.
 * Suporta 3 tipos de divisão: 'igual', 'porcentagem' e 'exato'.
 */

const SPLIT_TYPES = {
  IGUAL: 'igual',
  PORCENTAGEM: 'porcentagem',
  EXATO: 'exato',
};

/**
 * Validação se o tipo de divisão é válido e normalização de possíveis variações de entrada.
 */
const isSupportedSplitType = (type) => Object.values(SPLIT_TYPES).includes(type);

/**
 * Calculo de divisão igual / número de membros
 */
const calculateEqualSplit = (totalAmount, splitData) => {
  const recipientCount = splitData.length;
  if (recipientCount === 0) {
    throw new Error('Não há membros para dividir a despesa');
  }
  const perPerson = totalAmount / recipientCount;
  return splitData.map((split) => ({
    ...split,
    amount: Number(perPerson.toFixed(2)),
  }));
};

/**
 * Cálculo de divisão por porcentagem
 */
const calculatePercentageSplit = (totalAmount, splitData) => {
  const totalPercentage = splitData.reduce((acc, split) => acc + (split.percentage || 0), 0);
  if (Math.abs(totalPercentage - 100) > 0.01) {
    throw new Error('A soma das porcentagens deve ser 100%');
  }

  return splitData.map((split) => ({
    ...split,
    amount: Number(((split.percentage / 100) * totalAmount).toFixed(2)),
  }));
};

/**
 * Cálculo de divisão por valor exato
 */
const validateExactSplit = (totalAmount, splitData) => {
  const splitTotal = splitData.reduce((acc, split) => acc + (split.amount || 0), 0);
  if (Math.abs(splitTotal - totalAmount) > 0.01) {
    throw new Error('A soma dos valores exatos deve ser igual ao total da despesa');
  }
  return splitData.map((split) => ({
    ...split,
    amount: Number(split.amount.toFixed(2)),
  }));
};

/**
 * Função principal para calcular a divisão da despesa com base no tipo e detalhes fornecidos.
 * @param {string} splitType - 'igual', 'porcentagem' ou 'exato'
 * @param {number} totalAmount - valor total da despesa
 * @param {array} splitData - Array de objetos contendo detalhes da divisão (userId, percentage ou amount)
 * @returns {array} - array de objetos com usuário e valor a pagar
 */
const calculateSplit = (splitType, totalAmount, splitData) => {
  if (!isSupportedSplitType(splitType)) {
    throw new Error('Tipo de divisão não suportado. Use "igual", "porcentagem" ou "exato".');
  }

  if (!Array.isArray(splitData) || splitData.length === 0) {
    throw new Error('Detalhes da divisão são obrigatórios e devem ser um array não vazio.');
  }

  const normalizedAmount = Number(totalAmount);
  if (normalizedAmount <= 0) {
    throw new Error('Valor total da despesa deve ser um número positivo.');
  }

  switch (splitType) {
    case SPLIT_TYPES.IGUAL:
      return calculateEqualSplit(normalizedAmount, splitData);
    case SPLIT_TYPES.PORCENTAGEM:
      return calculatePercentageSplit(normalizedAmount, splitData);
    case SPLIT_TYPES.EXATO:
      return validateExactSplit(normalizedAmount, splitData);
    default:
      throw new Error('Tipo de divisão inválido');
  }
};

module.exports = {
  SPLIT_TYPES,
  isSupportedSplitType,
  calculateSplit,
  calculateEqualSplit,
  calculatePercentageSplit,
  validateExactSplit,
};
