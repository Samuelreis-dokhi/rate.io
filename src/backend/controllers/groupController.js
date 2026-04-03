const Group = require('../models/Group');
const User = require('../models/User');

exports.createGroup = async (req, res) => {
  try {
    const { name, category, icon } = req.body;

    // Simulando usuário autenticado (substituir pelo ID real do usuário autenticado)
    const user = req.user;

    const normalizedName = String(name || '').trim();

    // Validação de entrada
    if (!normalizedName || !category) {
      return res.status(400).json({
        error: 'Nome e categoria são obrigatórios',
      });
    }

    // Busca usuário no banco
    // Necessário pois o 'name' não é trazido pelo authMiddleware
    const userProfile = await User.findById(user.id);

    if (!userProfile) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Criação do grupo
    const group = await Group.create({
      name: normalizedName,
      category,
      icon: icon || null,
      adminId: user.id,
      members: [
        {
          userId: user.id,
          name: userProfile.name,
          balance: 0,
        },
      ],
    });

    return res.status(201).json({
      message: 'Grupo criado com sucesso!',
      group,
    });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Erro ao criar grupo. Por favor, tente novamente.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
