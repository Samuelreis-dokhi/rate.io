const Auth = require('../models/Auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const validatePassword = (password) => password && password.length >= 6;
const buildDefaultName = (email) => {
  const localPart = String(email || '').split('@')[0] || '';
  const cleaned = localPart.replace(/[._-]+/g, ' ').trim();
  return cleaned.length >= 2 ? cleaned : 'Usuario';
};

exports.register = async (req, res) => {
  try {
    const { email, password, name } = req.body;

    // Validação de entrada
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ error: 'Email inválido' });
    }

    if (!validatePassword(password)) {
      return res.status(400).json({
        error: 'Senha deve ter no mínimo 6 caracteres',
      });
    }

    // Verifica se email já existe
    const existingUser = await Auth.findOne({
      email: email.toLowerCase(),
    });
    if (existingUser) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    // Cria o registro de autenticação
    const authRecord = await Auth.create({ email, password });

    let userProfile;
    try {
      // Cria o perfil de usuário associado automaticamente
      userProfile = await User.create({
        name: name?.trim() || buildDefaultName(email),
        email,
        authId: authRecord._id,
      });
    } catch (profileError) {
      // Evita registro órfão em auth quando o perfil falha
      await Auth.deleteOne({ _id: authRecord._id });
      throw profileError;
    }

    res.status(201).json({
      message: 'Usuário criado com sucesso!',
      authId: authRecord._id,
      id: userProfile._id,
      name: userProfile.name,
      email: userProfile.email,
    });
  } catch (error) {
    if (error?.code === 11000) {
      return res.status(409).json({ error: 'Email já cadastrado' });
    }

    if (error?.name === 'ValidationError') {
      return res.status(400).json({ error: error.message });
    }

    return res.status(500).json({
      error: 'Erro ao registrar. Tente novamente.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validação de entrada
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }

    const user = await Auth.findOne({
      email: email.toLowerCase(),
      isActive: true,
    });

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }

    // Atualiza último login
    user.lastLogin = new Date();
    await user.save();

    // Gera o TOKEN
    const token = jwt.sign({ id: user._id, email: user.email }, process.env.JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({
      message: 'Login realizado com sucesso!',
      token,
      userId: user._id,
    });
  } catch (error) {
    return res.status(500).json({
      error: 'Erro ao fazer login. Tente novamente.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined,
    });
  }
};
