const mongoose = require('mongoose');
const Expense = require('../models/Expense');
const Group = require('../models/Group');
const User = require('../models/User');
const Activity = require('../models/Activity');
const splitService = require('../services/splitService');
const balanceService = require('../services/balanceService');

/**
 * First things first: Precisamos validar os dados de entrada, especialmente o tipo de divisão e os detalhes da divisão.
 * Aqui, nos vamos lidar com:
 * - Criar novas despesas
 * - Listar despesas de um grupo
 * - Marcar despesas como pagas
 * - Listar balanços de um grupo
 */

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isGroupMember = (group, userId) => {
  return group.members.some((member) => member.userId.toString() === userId.toString());
};

const getActiveGroupOrNull = async (groupId) => {
  return Group.findOne({ _id: groupId, isActive: true });
};

// Vamos às funções:
exports.createExpense = async (req, res) => {
  const { groupId, description, amount, currency, paidBy, createdBy, splitType, splitsData } =
    req.body;

  try {
    if (
      !groupId ||
      !description ||
      !amount ||
      !paidBy ||
      !createdBy ||
      !splitType ||
      !Array.isArray(splitsData)
    ) {
      return res.status(400).json({
        message: 'Dados obrigatórios estão pendentes ou inválidos.',
      });
    }

    if (!splitService.isSupportedSplitType(splitType)) {
      return res.status(400).json({
        message: 'Tipo de divisão não suportado. Use "igual", "porcentagem" ou "exato".',
      });
    }

    const idsToCheck = [groupId, paidBy, createdBy, ...splitsData.map((split) => split.userId)];
    const invalidId = idsToCheck.find((id) => !isValidObjectId(id));
    if (invalidId) {
      return res.status(400).json({ message: `ID inválido: ${invalidId}` });
    }

    const [group, payerUser] = await Promise.all([
      getActiveGroupOrNull(groupId),
      User.findById(paidBy),
    ]);

    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado ou inativo' });
    }
    if (!payerUser) {
      return res.status(404).json({ message: 'Usuário pagador não encontrado' });
    }
    if (!isGroupMember(group, paidBy) || !isGroupMember(group, createdBy)) {
      return res.status(403).json({ message: 'Os usuários devem ser membros do grupo' });
    }

    for (const split of splitsData) {
      if (!split.userId) {
        return res.status(400).json({ message: 'Cada divisão deve conter um userId' });
      }
      if (!isGroupMember(group, split.userId)) {
        return res.status(403).json({
          message: `Usuário ${split.userId} na divisão não é membro do grupo`,
        });
      }
    }

    const normalizedAmount = Number(amount);
    let calculatedSplits;

    try {
      calculatedSplits = splitService.calculateSplit(splitType, normalizedAmount, splitsData);
    } catch (error) {
      return res.status(400).json({ message: `Erro na divisão da despesa: ${error.message}` });
    }

    const expense = await Expense.create({
      groupId,
      description,
      amount: normalizedAmount,
      currency: currency || 'BRL',
      paidBy,
      createdBy,
      splitType,
      splits: calculatedSplits.map((split) => ({
        userId: split.userId,
        amount: Number(split.amount),
        status: split.userId === paidBy ? 'pago' : 'pendente',
        paidAt: split.userId === paidBy ? new Date() : null,
      })),
    });

    await Activity.create({
      groupId,
      actorUserId: createdBy,
      type: 'EXPENSE_CREATED',
      message: `${payerUser.name} adicionou uma despesa de ${normalizedAmount} ${currency || 'BRL'}: ${description}`,
      metadata: {
        expenseId: expense._id,
        amount: normalizedAmount,
        currency: currency || 'BRL',
        splitType,
      },
    });

    return res.status(201).json({ message: 'Despesa criada com sucesso', expense });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getGroupExpenses = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.query;

  try {
    if (!isValidObjectId(groupId) || !isValidObjectId(userId)) {
      return res.status(400).json({ message: 'IDs inválidos' });
    }

    const group = await getActiveGroupOrNull(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado ou inativo' });
    }
    if (!isGroupMember(group, userId)) {
      return res.status(403).json({ message: 'Usuário não é membro do grupo' });
    }

    const expenses = await Expense.find({ groupId }).sort({ createdAt: -1 });

    return res.status(200).json({ expenses });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

/**
 * Aqui temos uma função para marcar uma parte da despesa como paga. Isso é útil para dividir o pagamento em etapas ou para permitir que os usuários confirmem que pagaram sua parte.
 */
exports.settleExpenseShare = async (req, res) => {
  const { expenseId } = req.params;
  const { userId, paidBy } = req.body;

  try {
    if (!isValidObjectId(expenseId) || !isValidObjectId(userId) || !isValidObjectId(paidBy)) {
      return res.status(400).json({ message: 'IDs inválidos' });
    }

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }

    const group = await getActiveGroupOrNull(expense.groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado ou inativo' });
    }
    if (!isGroupMember(group, userId) || !isGroupMember(group, paidBy)) {
      return res.status(403).json({ message: 'Usuários devem ser membros do grupo' });
    }

    const splitIndex = expense.splits.findIndex(
      (split) => split.userId.toString() === userId.toString()
    );
    if (splitIndex === -1) {
      return res.status(404).json({ message: 'Divisão para o usuário não encontrada' });
    }
    if (expense.splits[splitIndex].status === 'pago') {
      return res.status(400).json({ message: 'Essa parte da despesa já foi marcada como paga' });
    }

    const [settledUser, paidUser] = await Promise.all([
      User.findById(expense.paidBy),
      User.findById(userId),
    ]);

    expense.splits[splitIndex].status = 'pago';
    expense.splits[splitIndex].paidAt = new Date();
    await expense.save();

    await Activity.create({
      groupId: expense.groupId,
      actorUserId: paidBy,
      targetUserId: expense.paidBy,
      type: 'EXPENSE_SETTLED',
      message: `${paidUser.name} marcou sua parte da despesa "${expense.description}" como paga para ${settledUser.name}`,
      metadata: {
        expenseId: expense._id,
        settledUserId: userId,
        paidBy: expense.paidBy,
        amount: expense.splits[splitIndex].amount,
        currency: expense.currency,
      },
    });

    return res.status(200).json({ message: 'Despesa marcada como paga com sucesso' });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.getGroupBalances = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.query;

  try {
    if (!isValidObjectId(groupId) || !isValidObjectId(userId)) {
      return res.status(400).json({ message: 'IDs inválidos' });
    }

    const group = await getActiveGroupOrNull(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado ou inativo' });
    }
    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }
    if (!isGroupMember(group, userId)) {
      return res.status(403).json({ message: 'Usuário não é membro do grupo' });
    }

    const balance = await balanceService.getUserGroupBalance(userId, groupId);
    return res.status(200).json({ balance });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
