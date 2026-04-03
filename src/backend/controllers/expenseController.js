const Expense = require('../models/Expense');
// const Group = require('../models/Group');

const calculateSplit = (amount, splitType, splitDetails, members) => {
  let distributions = {};
  let totalCheck = 0;

  if (splitType == 'equal') {
    const perPerson = amount / members.length;
    members.forEach((member) => {
      distributions[member.user.toString()] = perPerson;
    });
  } else if (splitType == 'percentage') {
    let totalPercentage = 0;
    splitDetails.forEach((detail) => {
      totalPercentage += detail.percentage;
      distributions[detail.user.toString()] = amount * (detail.percentage / 100);
    });
    if (totalPercentage !== 100) throw new Error('A soma das porcentagens deve ser 100%');
  } else if (splitType == 'exact') {
    splitDetails.forEach((detail) => {
      totalCheck += detail.amount;
      distributions[detail.user.toString()] = detail.amount;
    });
    if (Math.abs(totalCheck - amount) !== 0)
      throw new Error('A soma dos valores exatos não batem com o total');
  }
  return distributions;
};

const addExpense = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { description, amount, paidBy, splitType, splitDetails, receiptImage } = req.body;

    //const group = await Group.findById(groupId);

    const group = {
      _id: groupId,
      members: [
        { user: 'prima', balance: 0 },
        { user: 'segundo', balance: 0 },
      ],
    };

    if (!group) return res.status(404).json({ message: 'Grupo não encontrado' });

    const isPaidByMember = group.members.some((m) => m.user.toString() === paidBy);
    if (!isPaidByMember)
      return res.status(400).json({ message: 'O usuário que pagou deve ser um membro do grupo' });

    const distributions = calculateSplit(amount, splitType, splitDetails, group.members);

    const expense = await Expense.create({
      group: groupId,
      description,
      amount,
      paidBy,
      splitType,
      splitDetails,
      receiptImage,
    });

    group.members.forEach((member) => {
      const memberId = member.user.toString();
      if (memberId === paidBy) {
        member.balance += amount - distributions[memberId];
      }
      if (distributions[memberId]) {
        member.balance -= distributions[memberId];
      }
    });

    //await group.save();

    res.status(201).json({ message: 'Despesa adicionada com sucesso', expense });
  } catch (error) {
    console.error('Erro ao adicionar despesa:', error);
    res.status(500).json({ message: 'Erro ao adicionar despesa', error: error.message });
  }
};

module.exports = { addExpense };
