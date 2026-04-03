const Expense = require('../models/Expense');
// const Group = require('../models/Group');

const normalizeSplitType = (splitType) => {
  const aliases = {
    equal: 'igual',
    percentage: 'porcentagem',
    exact: 'exato',
    igual: 'igual',
    porcentagem: 'porcentagem',
    exato: 'exato',
  };

  return aliases[String(splitType || '').toLowerCase()] || null;
};

const calculateSplit = (amount, splitType, splitDetails, members) => {
  const distributions = {};
  let totalCheck = 0;
  const totalAmount = Number(amount);

  if (!Number.isFinite(totalAmount) || totalAmount <= 0) {
    throw new Error('Valor da despesa inválido');
  }

  if (!Array.isArray(members) || members.length === 0) {
    throw new Error('Grupo sem membros para dividir a despesa');
  }

  if (splitType === 'igual') {
    const perPerson = totalAmount / members.length;
    members.forEach((member) => {
      distributions[member.user.toString()] = perPerson;
    });
  } else if (splitType === 'porcentagem') {
    if (!Array.isArray(splitDetails) || splitDetails.length === 0) {
      throw new Error('Detalhes da divisão são obrigatórios para porcentagem');
    }

    let totalPercentage = 0;
    splitDetails.forEach((detail) => {
      const percentage = Number(detail.percentage || 0);
      totalPercentage += percentage;
      distributions[detail.userId.toString()] = totalAmount * (percentage / 100);
    });

    if (Math.abs(totalPercentage - 100) > 0.0001) {
      throw new Error('A soma das porcentagens deve ser 100%');
    }
  } else if (splitType === 'exato') {
    if (!Array.isArray(splitDetails) || splitDetails.length === 0) {
      throw new Error('Detalhes da divisão são obrigatórios para divisão exata');
    }

    splitDetails.forEach((detail) => {
      const splitAmount = Number(detail.amount || 0);
      totalCheck += splitAmount;
      distributions[detail.userId.toString()] = splitAmount;
    });

    if (Math.abs(totalCheck - totalAmount) > 0.0001) {
      throw new Error('A soma dos valores exatos não batem com o total');
    }
  } else {
    throw new Error('Tipo de divisão inválido');
  }

  return distributions;
};

const addExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const {
      description,
      amount,
      paidByUserId,
      splitType,
      splitDetails = [],
      receiptImage,
    } = req.body;
    const normalizedSplitType = normalizeSplitType(splitType);
    const payerId = paidByUserId || req.user.id;

    if (!description || !String(description).trim()) {
      return res.status(400).json({ message: 'Descrição é obrigatória' });
    }

    if (!normalizedSplitType) {
      return res.status(400).json({ message: 'Tipo de divisão inválido' });
    }

    if (!payerId) {
      return res.status(400).json({ message: 'Usuário pagador não informado' });
    }

    // Mock de grupo para viabilizar testes até o serviço de Groups estar implementado.
    const uniqueMemberIds = new Set([payerId]);
    splitDetails.forEach((detail) => {
      if (detail?.userId) uniqueMemberIds.add(detail.userId);
    });

    //const group = await Group.findById(groupId);
    const group = {
      _id: groupId,
      members: [...uniqueMemberIds].map((userId) => ({ user: String(userId), balance: 0 })),
    };

    if (!group) return res.status(404).json({ message: 'Grupo não encontrado' });

    const isPaidByMember = group.members.some((m) => m.user.toString() === String(payerId));
    if (!isPaidByMember)
      return res.status(400).json({ message: 'O usuário que pagou deve ser um membro do grupo' });

    const parsedSplitDetails = splitDetails.map((detail) => ({
      userId: detail.userId,
      amount: Number(detail.amount || 0),
      percentage: Number(detail.percentage || 0),
      isPaid: Boolean(detail.isPaid || false),
      paidAt: detail.paidAt || null,
    }));

    const distributions = calculateSplit(
      Number(amount),
      normalizedSplitType,
      parsedSplitDetails,
      group.members
    );

    const expense = await Expense.create({
      group: groupId,
      description: String(description).trim(),
      amount: Number(amount),
      paidByUserId: payerId,
      splitType: normalizedSplitType,
      splitDetails: parsedSplitDetails,
      receiptImage,
    });

    group.members.forEach((member) => {
      const memberId = member.user.toString();
      if (memberId === String(payerId)) member.balance += Number(amount);
      if (distributions[memberId]) {
        member.balance -= distributions[memberId];
      }
    });

    //await group.save();

    res.status(201).json({
      message: 'Despesa adicionada com sucesso',
      expense,
      distributions,
      mockGroupBalances: group.members,
    });
  } catch (error) {
    res.status(500).json({ message: 'Erro ao adicionar despesa', error: error.message });
  }
};

module.exports = { addExpense };
