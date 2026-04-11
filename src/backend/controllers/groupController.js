/* 
Na nossa aplicação, o groupController irá ser responsável por lidar com as requisições relacionadas aos grupos:
- Criação de grupos
- Adicionar um membro ao grupo
- Convidar um membro para o grupo por email
- Listar os membros
- Listar as atividades do grupo
- Deletar o grupo
*/

const mongoose = require('mongoose'); // mongoose sempre deve ser importado para lidar com os tipos de dados do MongoDB
const Group = require('../models/Group');
const User = require('../models/User');
const Expense = require('../models/Expense');
const Activity = require('../models/Activity');

/* Define uma função para validar se um ID é um ObjectId válido */
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

/* Verifica se o usuáriuo é de fato um membro do grupo */
const isMember = (group, userId) => {
  return group.members.some((member) => member.userId.toString() === userId.toString());
};

/* Verificamos se o grupo está ativo */
const getActiveGroupOrNull = async (groupId) => {
  return Group.findOne({ _id: groupId, isActive: true });
};

exports.createGroup = async (req, res) => {
  const { name, description, createdBy, membersIds = [] } = req.body;
  try {
    if (!name || !createdBy) {
      return res.status(400).json({ message: 'Nome e ID do criador são obrigatórios' });
    }
    /* Validação de nome para que seja compatível com o teste de grupos */
    const normalizedName = String(name).trim();
    if (normalizedName.length < 2) {
      return res.status(400).json({ message: 'Nome deve ter no mínimo 2 caracteres' });
    }

    if (normalizedName.length > 100) {
      return res.status(400).json({ message: 'Nome deve ter no máximo 100 caracteres' });
    }

    if (!isValidObjectId(createdBy)) {
      return res.status(400).json({ message: 'ID do criador inválido' });
    }

    const creator = await User.findById(createdBy);
    if (!creator) {
      return res.status(404).json({ message: 'Usuário criador não encontrado' });
    }

    /* Valida os IDs dos membros */
    if (!Array.isArray(membersIds)) {
      return res.status(400).json({ message: 'membersIds deve ser um array' });
    }

    const normalizedMemberIds = [...new Set(membersIds.map((id) => String(id)))]; // Remove duplicatas e garante que sejam strings
    const invalidMemberId = normalizedMemberIds.find((id) => !isValidObjectId(id));
    if (invalidMemberId) {
      return res.status(400).json({ message: 'ID de membro inválido: ' + invalidMemberId });
    }

    /* Cria a lista de membros para o grupo */
    const members = [
      { userId: createdBy, role: 'admin' },
      ...normalizedMemberIds
        .filter((id) => id !== String(createdBy)) // Evita adicionar o criador como membro novamente
        .map((id) => ({ userId: id, role: 'member' })),
    ];

    // Criação do grupo
    const group = await Group.create({
      name,
      description,
      createdBy,
      members,
    });

    await Activity.create({
      groupId: group._id,
      actorUserId: createdBy,
      type: 'GROUP_CREATED',
      message: `${creator.name} criou o grupo '${group.name}'`,
      metadata: {
        groupId: group._id,
        membersCount: group.members.length,
      },
    });

    return res.status(201).json(group);
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao criar o grupo', details: error.message });
  }
};

exports.addMember = async (req, res) => {
  const { groupId } = req.params;
  const { userId, addedBy } = req.body;

  try {
    if (!isValidObjectId(groupId) || !isValidObjectId(userId) || !isValidObjectId(addedBy)) {
      return res.status(400).json({ message: 'IDs inválidos' });
    }

    const [group, memberUser, actorUser] = await Promise.all([
      getActiveGroupOrNull(groupId),
      User.findById(userId),
      User.findById(addedBy),
    ]);

    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado ou inativo' });
    }

    if (!memberUser || !actorUser) {
      return res.status(404).json({ message: 'Usuário membro ou ator não encontrado' });
    }

    if (!isMember(group, addedBy)) {
      return res
        .status(403)
        .json({ message: 'Apenas membros do grupo podem adicionar novos membros' });
    }

    if (isMember(group, userId)) {
      return res.status(400).json({ message: 'Usuário já é membro do grupo' });
    }

    group.members.push({ userId, role: 'member' });
    await group.save();

    await Activity.create({
      groupId: group._id,
      actorUserId: addedBy,
      targetUserId: userId,
      type: 'MEMBER_ADDED',
      message: `${actorUser.name} adicionou ${memberUser.name} ao grupo '${group.name}'`,
      metadata: {
        groupId: group._id,
        addedUserId: userId,
      },
    });
    return res.status(200).json(group);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Erro ao adicionar membro ao grupo', details: error.message });
  }
};

exports.inviteMember = async (req, res) => {
  // Lógica para convidar um membro por email
  const { groupId } = req.params;
  const { email, addedBy } = req.body;

  try {
    if (!isValidObjectId(groupId) || !isValidObjectId(addedBy) || !email) {
      return res
        .status(400)
        .json({ message: 'ID do grupo, email e ID do convidante são obrigatórios' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const [group, actorUser, invitedUser] = await Promise.all([
      getActiveGroupOrNull(groupId),
      User.findById(addedBy),
      User.findOne({ email: normalizedEmail }),
    ]);

    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado ou inativo' });
    }

    if (!actorUser) {
      return res.status(404).json({ message: 'Usuário convidante não encontrado' });
    }

    if (!invitedUser) {
      // Aqui poderíamos criar um convite para um email que ainda não tem conta, mas por enquanto vamos exigir que o usuário exista
      return res.status(404).json({ message: 'Usuário convidado não encontrado' });
    }

    if (!isMember(group, addedBy)) {
      return res
        .status(403)
        .json({ message: 'Apenas membros do grupo podem convidar novos membros' });
    }

    if (isMember(group, invitedUser._id)) {
      return res.status(400).json({ message: 'Usuário já é membro do grupo' });
    }

    group.members.push({ userId: invitedUser._id, role: 'member' });
    await group.save();

    await Activity.create({
      groupId: group._id,
      actorUserId: addedBy,
      targetUserId: invitedUser._id,
      type: 'MEMBER_ADDED',
      message: `${actorUser.name} adicionou ${invitedUser.name} ao grupo '${group.name}'`,
      metadata: {
        groupId: group._id,
        invitedUserId: invitedUser._id,
        invitedUserEmail: normalizedEmail,
      },
    });

    return res.status(200).json(group);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Erro ao convidar membro para o grupo', details: error.message });
  }
};

exports.getUserGroups = async (req, res) => {
  const { userId } = req.params;

  try {
    if (!isValidObjectId(userId)) {
      return res.status(400).json({ message: 'ID de usuário inválido' });
    }

    const groups = await Group.find({
      isActive: true,
      'members.userId': userId,
    }).sort({ updatedAt: -1 });

    return res.status(200).json(groups);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Erro ao buscar grupos do usuário', details: error.message });
  }
};

exports.getGroupActivities = async (req, res) => {
  const { groupId } = req.params;
  const { userId, limit = 50 } = req.query;

  try {
    if (!isValidObjectId(groupId) || !isValidObjectId(userId)) {
      return res.status(400).json({ message: 'IDs inválidos' });
    }

    if (!userId || !isValidObjectId(userId)) {
      return res.status(400).json({ message: 'ID do usuário é obrigatório e deve ser válido' });
    }

    const group = await getActiveGroupOrNull(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado ou inativo' });
    }

    if (!isMember(group, userId)) {
      return res.status(403).json({ message: 'Apenas membros do grupo podem ver as atividades' });
    }

    const safeLimit = Math.min(Math.max(Number(limit) || 50, 1), 200); // Limita o número de atividades retornadas entre 1 e 200

    const activities = await Activity.find({ groupId }).sort({ createdAt: -1 }).limit(safeLimit);

    return res.status(200).json(activities);
  } catch (error) {
    return res
      .status(500)
      .json({ error: 'Erro ao buscar atividades do grupo', details: error.message });
  }
};

exports.deleteGroup = async (req, res) => {
  const { groupId } = req.params;
  const { userId } = req.body;

  try {
    if (!isValidObjectId(groupId) || !isValidObjectId(userId)) {
      return res.status(400).json({ message: 'IDs inválidos' });
    }

    const group = await getActiveGroupOrNull(groupId);
    if (!group) {
      return res.status(404).json({ message: 'Grupo não encontrado ou inativo' });
    }

    if (!isMember(group, userId)) {
      return res.status(403).json({ message: 'Apenas membros do grupo podem deletar o grupo' });
    }

    if (String(group.createdBy) !== String(userId)) {
      return res.status(403).json({ message: 'Apenas o criador do grupo pode deletar o grupo' });
    }

    const openExpense = await Expense.findOne({
      groupId,
      'splits.status': 'pendente',
    }).select('_id');

    if (openExpense) {
      return res
        .status(400)
        .json({ message: 'Não é possível deletar o grupo enquanto houver despesas em aberto' });
    }

    group.isActive = false;
    await group.save();

    const actor = await User.findById(userId);
    await Activity.create({
      groupId: group._id,
      actorUserId: userId,
      type: 'GROUP_DELETED',
      message: `${(actor && actor.name) || 'Um membro'} deletou o grupo '${group.name}'`,
      metadata: {
        groupId: group._id,
        deletedBy: userId,
      },
    });

    return res.status(200).json({ message: 'Grupo deletado com sucesso' });
  } catch (error) {
    return res.status(500).json({ error: 'Erro ao deletar o grupo', details: error.message });
  }
};
