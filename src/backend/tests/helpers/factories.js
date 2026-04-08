/* funções para criar dados de teste */
const mongoose = require('mongoose');

// Gera um ID de objeto MongoDB válido
const newId = () => new mongoose.Types.ObjectId();

// Cria um usuário de teste
const createUser = (overrides = {}) => ({
  name: 'Usuario de Teste',
  email: `teste_${Date.now()}@example.com`,
  authId: newId(),
  isActive: true,
  ...overrides,
});

// Cria um grupo de teste
const createGroup = (options = {}) => {
  const { createdBy = newId(), memberIds = [], ...overrides } = options;

  return {
    name: 'Grupo de Teste',
    description: 'Um grupo de teste Jest',
    createdBy,
    members: [
      {
        userId: createdBy,
        role: 'admin',
      },
      ...memberIds.map((id) => ({ userId: id, role: 'member' })),
    ],
    ...overrides,
  };
};

// Cria despesas de teste
const createExpense = (groupId, paidBy, memberIds, overrides = {}) => {
  const allMembers = [paidBy, ...memberIds];
  const perPerson = parseFloat((100 / allMembers.length).toFixed(2));

  return {
    groupId,
    description: 'Despesa de teste',
    amount: 100,
    currency: 'BRL',
    paidBy,
    createdBy: paidBy,
    splitType: 'igual',
    splits: allMembers.map((userId) => ({
      userId,
      amount: perPerson,
      status: userId.toString() === paidBy.toString() ? 'pago' : 'pendente',
      paidAt: userId.toString() === paidBy.toString() ? new Date() : null,
    })),
    ...overrides,
  };
};

module.exports = { newId, createUser, createGroup, createExpense };
