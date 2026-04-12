/**
 * balanceService.js calcula os saldos dos usuários com base nas despesas e atividades do grupo.
 * Rastreia quanto cada usuário deve receber ou pagar, possibilitando a visualização clara das dívidas e créditos dentro do grupo.
 */

const Expense = require('../models/Expense');

/**
 * Pega todos os saldos de um grupo
 * Returns: { userId -> { paid, owed, NetBalance } }
 * balance > 0: Usuário tem crédito (deve receber)
 * balance < 0: Usuário tem débito (deve pagar)
 * balance = 0: Usuário está equilibrado
 */
const getGroupBalances = async (groupId) => {
  const expenses = await Expense.find({ groupId });

  const balances = {};

  expenses.forEach((expense) => {
    const paidByUserId = String(expense.paidBy);
    const splits = Array.isArray(expense.splits) ? expense.splits : [];

    // Atualiza o valor pago pelo usuário
    if (!balances[paidByUserId]) {
      balances[paidByUserId] = { paid: 0, owed: 0 };
    }

    // Somente despesas abertas ou pendentes afetam os saldos
    splits.forEach((split) => {
      const { userId, amount: splitAmount, status } = split;

      // Se a despesa estiver pendente, ela não afeta os saldos até ser confirmada
      if (status === 'pago') return;

      const splitUserId = String(userId);

      // Atualiza o valor devido para o usuário do split
      if (!balances[splitUserId]) {
        balances[splitUserId] = { paid: 0, owed: 0 };
      }

      balances[splitUserId].owed += splitAmount;
      balances[paidByUserId].paid += splitAmount;
    });
  });

  // Calcula o saldo final para cada usuário
  const netBalances = {};
  Object.entries(balances).forEach(([userId, { paid, owed }]) => {
    netBalances[userId] = {
      paid: parseFloat(paid.toFixed(2)),
      owed: parseFloat(owed.toFixed(2)),
      balance: parseFloat((paid - owed).toFixed(2)),
    };
  });

  return netBalances;
};

/**
 * Balanço simplificado para um usuário específico dentro de um grupo
 * @returns {object} { totalPaid, totalOwed, netBalance, summary }
 */
const getUserGroupBalance = async (userId, groupId) => {
  const balances = await getGroupBalances(groupId);
  const userBalance = balances[userId] || { paid: 0, owed: 0, balance: 0 };

  const summary =
    userBalance.balance > 0
      ? `${userBalance.balance} a receber`
      : userBalance.balance < 0
        ? `${Math.abs(userBalance.balance)} a pagar`
        : 'Saldo equilibrado';

  return {
    totalPaid: userBalance.paid,
    totalOwed: userBalance.owed,
    netBalance: userBalance.balance,
    summary,
  };
};

/**
 * Quem deve pagar quem? (devedor -> credor relacionamento).
 * @returns {array} Array de { devedor, credor, valor }
 */
const getGroupPaymentGraph = async (groupId) => {
  const balances = await getGroupBalances(groupId);
  const users = Object.keys(balances);
  const remainingCredits = {};

  users.forEach((userId) => {
    remainingCredits[userId] = Math.max(balances[userId].balance, 0);
  });

  const paymentGraph = [];

  for (let i = 0; i < users.length; i++) {
    const debtorId = users[i];
    const debtorBalance = balances[debtorId];

    if (debtorBalance.balance < 0) {
      // Esse usuário é um devedor, precisa pagar a alguém
      const totalOwed = Math.abs(debtorBalance.balance);
      let remainingDebt = totalOwed;

      // Tenta casar o devedor com os credores
      for (let j = 0; j < users.length && remainingDebt > 0.01; j++) {
        const creditorId = users[j];
        if (debtorId === creditorId) continue; // Não pode pagar a si mesmo

        const creditorRemainingCredit = remainingCredits[creditorId];
        if (creditorRemainingCredit > 0.01) {
          const paymentAmount = Math.min(remainingDebt, creditorRemainingCredit);
          paymentGraph.push({
            devedor: debtorId,
            credor: creditorId,
            valor: parseFloat(paymentAmount.toFixed(2)),
          });
          remainingDebt -= paymentAmount;
          remainingCredits[creditorId] -= paymentAmount;
        }
      }
    }
  }
  return paymentGraph;
};

module.exports = {
  getGroupBalances,
  getUserGroupBalance,
  getGroupPaymentGraph,
};
