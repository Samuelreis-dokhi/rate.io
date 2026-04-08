/* helper para gerar tokens JWT de teste */
const jwt = require('jsonwebtoken');

// Gera um token JWT de teste para um usuário
const generateToken = (userId, email = 'test@teste.com') => {
  return jwt.sign({ id: userId, email }, process.env.JWT_SECRET || 'test-secret-key-for-jest', {
    expiresIn: '1h',
  });
};

// Retorna o header Authorization pronto para usar no Supertest
const authHeader = (userId, email) => ({
  Authorization: `Bearer ${generateToken(userId, email)}`,
});

module.exports = { generateToken, authHeader };
