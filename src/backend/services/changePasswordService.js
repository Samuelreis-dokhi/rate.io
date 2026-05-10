const bcrypt = require('bcryptjs');

const createServiceError = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateChangePasswordPayload = ({ currentPassword, newPassword, confirmPassword }) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw createServiceError('Todos os campos são obrigatórios', 400);
  }

  if (newPassword.length < 6) {
    throw createServiceError('Nova senha deve ter no mínimo 6 caracteres', 400);
  }

  if (newPassword !== confirmPassword) {
    throw createServiceError('Senhas não conferem', 400);
  }
};

const changePassword = async ({ Auth, authId, currentPassword, newPassword, confirmPassword }) => {
  validateChangePasswordPayload({ currentPassword, newPassword, confirmPassword });

  const auth = await Auth.findById(authId);
  if (!auth || !auth.isActive) {
    throw createServiceError('Usuário não encontrado', 404);
  }

  const isPasswordValid = await bcrypt.compare(currentPassword, auth.password);
  if (!isPasswordValid) {
    throw createServiceError('Senha atual incorreta', 401);
  }

  const isSamePassword = await bcrypt.compare(newPassword, auth.password);
  if (isSamePassword) {
    throw createServiceError('a senha nao pode ser a mesma utilizada anteriormente', 400);
  }

  auth.password = newPassword;
  await auth.save();
};

module.exports = {
  changePassword,
  validateChangePasswordPayload,
};
