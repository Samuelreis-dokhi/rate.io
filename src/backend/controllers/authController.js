const getAuthModel = require('../models/Auth');
const getUserModel = require('../models/User');



const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const validateEmail = (email) => /^\S+@\S+\.\S+$/.test(email);
const validatePassword = (password) => password && password.length >= 6;
// const buildDefaultName = (email) => {
//   const localPart = String(email || '').split('@')[0] || '';
//   const cleaned = localPart.replace(/[._-]+/g, ' ').trim();
//   return cleaned.length >= 2 ? cleaned : 'Usuario';
// };

exports.register = async (req, res) => {
  const Auth = getAuthModel('../models/Auth');
  const User = getUserModel('../models/User');

  try {
    const { email, password, name } = req.body || {};
    const normalizedName = String(name || '').trim();

    // Validação de entrada
    if (!email || !password || !normalizedName) {
      return res.status(400).json({ error: 'Nome, email e senha são obrigatórios' });
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
        name: normalizedName,
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
  const Auth = getAuthModel();

  try {
    const { email, password } = req.body || {};

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


/**
 * Trocar senha do usuário autenticado
 * Valida senha atual antes de trocar
 */
changePassword: async (req, res) => {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    const authId = req.user.id;

    // Validação de entrada
    if (!currentPassword || !newPassword || !confirmPassword) {
      return res.status(400).json({ 
        message: 'Todos os campos são obrigatórios' 
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ 
        message: 'Nova senha deve ter no mínimo 6 caracteres' 
      });
    }

    if (newPassword !== confirmPassword) {
      return res.status(400).json({ 
        message: 'Senhas não conferem' 
      });
    }

    if (currentPassword === newPassword) {
      return res.status(400).json({ 
        message: 'Nova senha não pode ser igual à anterior' 
      });
    }

    // Buscar Auth do usuário
    const auth = await Auth.findById(authId);
    if (!auth) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Validar senha atual
    const isPasswordValid = await bcrypt.compare(currentPassword, auth.password);
    if (!isPasswordValid) {
      return res.status(401).json({ 
        message: 'Senha atual incorreta' 
      });
    }

    // Hash da nova senha
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    auth.password = hashedPassword;
    await auth.save();

    res.status(200).json({ 
      message: 'Senha alterada com sucesso' 
    });

  } catch (error) {
    console.error('Erro ao trocar senha:', error);
    res.status(500).json({ 
      message: 'Erro ao trocar senha', 
      error: error.message 
    });
  }
}