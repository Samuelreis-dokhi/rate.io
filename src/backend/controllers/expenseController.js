const mongoose = require('mongoose');
const fs = require('fs/promises');
const path = require('path');

const Expense = require('../models/Expense');
const getGroupModel = require('../models/Group');
const getUserModel = require('../models/User');
const Activity = require('../models/Activity');
const splitService = require('../services/splitService');
const balanceService = require('../services/balanceService');

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isGroupMember = (group, userId) => {
  if (!userId) return false;
  return group.members.some((member) => member.userId.toString() === userId.toString());
};

const getActiveGroupOrNull = async (groupId) => {
  const Group = getGroupModel();
  return Group.findOne({ _id: groupId, isActive: true });
};

const parseSplitsData = (value) => {
  if (Array.isArray(value)) return value;

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value);
      return Array.isArray(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  return null;
};

const buildAttachmentPayload = (req, file) => {
  if (!file) return null;

  return {
    url: `${req.protocol}://${req.get('host')}/uploads/receipts/${file.filename}`,
    name: file.originalname,
    mimeType: file.mimetype,
    size: file.size,
    uploadedAt: new Date(),
  };
};

const removeAttachmentFromDisk = async (attachmentUrl) => {
  if (!attachmentUrl) return;

  try {
    const filename = path.basename(new URL(attachmentUrl).pathname);
    await fs.unlink(path.join(__dirname, '..', 'uploads', 'receipts', filename));
  } catch {
    // Ignora se o arquivo não existir no disco.
  }
};

exports.createExpense = async (req, res) => {
  const User = getUserModel();
  const { groupId, description, amount, currency, paidBy, createdBy, splitType } = req.body;
  const splitsData = parseSplitsData(req.body.splitsData);
  const attachment = buildAttachmentPayload(req, req.file);

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
      attachment,
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
        attachmentUrl: attachment ? attachment.url : null,
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

exports.settleExpenseShare = async (req, res) => {
  const User = getUserModel();
  const { expenseId } = req.params;
  const { userId, paidBy } = req.body || {};

  try {
    if (!userId || !paidBy) {
      return res.status(400).json({ message: 'userId e paidBy são obrigatórios' });
    }

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
      type: 'PAYMENT_SETTLED',
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

exports.updateExpense = async (req, res) => {
  const User = getUserModel();
  const { expenseId } = req.params;
  const {
    description,
    amount,
    currency,
    paidBy,
    splitType,
    updatedBy,
  } = req.body;

  const splitsData = parseSplitsData(req.body.splitsData);
  const newAttachment = buildAttachmentPayload(req, req.file);

  try {
    if (!isValidObjectId(expenseId)) {
      return res.status(400).json({ message: 'ID de despesa inválido' });
    }

    if (!updatedBy || !isValidObjectId(updatedBy)) {
      return res.status(400).json({
        message: 'updatedBy é obrigatório e deve ser um ID válido',
      });
    }

    const user = await User.findById(updatedBy);
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const expense = await Expense.findById(expenseId);
    if (!expense) {
      return res.status(404).json({ message: 'Despesa não encontrada' });
    }

    const group = await getActiveGroupOrNull(expense.groupId);
    if (!group || !isGroupMember(group, updatedBy)) {
      return res.status(403).json({
        message: 'Não autorizado para atualizar esta despesa',
      });
    }

    if (paidBy && !isGroupMember(group, paidBy)) {
      return res.status(403).json({
        message: 'Novo pagador não é membro do grupo',
      });
    }

    if (splitType && !splitService.isSupportedSplitType(splitType)) {
      return res.status(400).json({
        message: 'Tipo de divisão não suportado. Use "igual", "porcentagem" ou "exato".',
      });
    }

    const isAmountChanged = amount !== undefined && Number(amount) !== expense.amount;
    const isSplitTypeChanged = splitType && splitType !== expense.splitType;
    const shouldRecalculateSplits = Array.isArray(splitsData) && splitsData.length > 0;

    if ((isAmountChanged || isSplitTypeChanged) && !shouldRecalculateSplits) {
      return res.status(400).json({
        message: 'Para alterar valor ou tipo de divisão, envie splitsData.',
      });
    }

    if (description) expense.description = description;
    if (amount !== undefined) expense.amount = Number(amount);
    if (currency) expense.currency = currency;
    if (paidBy) expense.paidBy = paidBy;
    if (splitType) expense.splitType = splitType;

    if (newAttachment) {
      if (expense.attachment?.url) {
        await removeAttachmentFromDisk(expense.attachment.url);
      }
      expense.attachment = newAttachment;
    }

    if (shouldRecalculateSplits) {
      const idsToCheck = splitsData.map((split) => split.userId);
      const invalidId = idsToCheck.find((id) => !isValidObjectId(id));
      if (invalidId) {
        return res.status(400).json({ message: `ID inválido: ${invalidId}` });
      }

      for (const split of splitsData) {
        if (!split.userId) {
          return res.status(400).json({
            message: 'Cada divisão deve conter um userId',
          });
        }
        if (!isGroupMember(group, split.userId)) {
          return res.status(403).json({
            message: `Usuário ${split.userId} na divisão não é membro do grupo`,
          });
        }
      }

      const splitBaseAmount = amount !== undefined ? Number(amount) : expense.amount;
      const splitBaseType = splitType || expense.splitType;

      const calculatedSplits = splitService.calculateSplit(
        splitBaseType,
        splitBaseAmount,
        splitsData
      );

      expense.splits = calculatedSplits.map((split) => ({
        userId: split.userId,
        amount: Number(split.amount),
        status: split.userId.toString() === expense.paidBy.toString() ? 'pago' : 'pendente',
        paidAt: split.userId.toString() === expense.paidBy.toString() ? new Date() : null,
      }));
    } else if (paidBy) {
      expense.splits = expense.splits.map((split) => ({
        ...split,
        status: split.userId.toString() === paidBy.toString() ? 'pago' : 'pendente',
        paidAt: split.userId.toString() === paidBy.toString() ? new Date() : null,
      }));
    }

    await expense.save();

    await Activity.create({
      groupId: expense.groupId,
      actorUserId: updatedBy,
      type: 'EXPENSE_UPDATED',
      message: `${user.name} atualizou a despesa: ${description || expense.description}`,
      metadata: {
        expenseId: expense._id,
        amount: expense.amount,
        attachmentUrl: expense.attachment?.url || null,
      },
    });

    return res.status(200).json({
      message: 'Despesa atualizada com sucesso',
      expense,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

exports.deleteExpense = async (req, res) => {
  const User = getUserModel()
  const { expenseId } = req.params
  const authId = req.user?.id

  try {
    if (!isValidObjectId(expenseId)) {
      return res.status(400).json({ message: 'ID de despesa inválido' })
    }

    if (!authId || !isValidObjectId(authId)) {
      return res.status(401).json({ message: 'Usuário autenticado inválido' })
    }

    const user = await User.findByAuthId(authId)
    if (!user) {
      return res.status(404).json({ message: 'Usuário não encontrado' })
    }

    const expense = await Expense.findById(expenseId)
    if (!expense) {
      return res.status(404).json({ message: 'Despesa não encontrada' })
    }

    const group = await getActiveGroupOrNull(expense.groupId)
    if (!group || !isGroupMember(group, user._id)) {
      return res.status(403).json({ message: 'Não autorizado para deletar esta despesa' })
    }

    if (expense.attachment?.url) {
      await removeAttachmentFromDisk(expense.attachment.url)
    }

    await Expense.findByIdAndDelete(expenseId)

    try {
      await Activity.create({
        groupId: expense.groupId,
        actorUserId: user._id,
        type: 'EXPENSE_DELETED',
        message: `${user.name || 'Usuário'} deletou uma despesa no grupo`,
        metadata: {
          expenseId: expense._id,
          amount: expense.amount,
          description: expense.description,
        },
      })
    } catch (activityError) {
      console.error('Falha ao registrar atividade de exclusão:', activityError)
    }

    return res.status(200).json({ message: 'Despesa deletada com sucesso' })
  } catch (error) {
    return res.status(500).json({ message: error.message })
  }
};
