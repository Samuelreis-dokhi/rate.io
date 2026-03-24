const User = require('../models/User');

// const buildDefaultName = (email) => {
//   const localPart = String(email || '').split('@')[0] || '';
//   const cleaned = localPart.replace(/[._-]+/g, ' ').trim();
//   return cleaned.length >= 2 ? cleaned : 'Usuario';
// };

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findByAuthId(req.user.id);

    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    res.json(user);
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao buscar perfil.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.createProfile = async (req, res) => {
  try {
    const { name, email } = req.body;
    const normalizedName = String(name || '').trim();
    const authId = req.user?.id;
    const profileEmail = (email || req.user?.email || '').toLowerCase();

    if (!authId || !profileEmail || !normalizedName) {
      return res.status(400).json({ error: 'Nome é obrigatório para criação de perfil' });
    }

    const existingProfileByAuth = await User.findByAuthId(authId);
    if (existingProfileByAuth) {
      return res.status(409).json({ error: 'Perfil já existe para este usuário' });
    }

    const existingProfile = await User.findOne({ email: profileEmail });
    if (existingProfile) {
      return res.status(409).json({ error: 'Perfil já existe para este email' });
    }

    const user = await User.create({
      name: normalizedName,
      email: profileEmail,
      authId,
    });

    res.status(201).json({
      message: 'Perfil criado com sucesso!',
      id: user._id,
      name: user.name,
      email: user.email,
    });
  } catch (error) {
    if (error?.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Erro ao criar perfil.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const { name, avatarUrl } = req.body;

    const user = await User.findByAuthId(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    if (name) user.name = name;
    if (avatarUrl) user.avatarUrl = avatarUrl;

    await user.save();

    res.json({
      message: 'Perfil atualizado com sucesso!',
      id: user._id,
      name: user.name,
      avatarUrl: user.avatarUrl,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao atualizar perfil.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
