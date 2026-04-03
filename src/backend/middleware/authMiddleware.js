// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      message: 'Token de autenticação ausente ou mal formatado',
    });
  }

  const token = authHeader.split(' ')[1];

  if (!process.env.JWT_SECRET) {
    return res.status(401).json({
      message: 'Chave secreta para JWT não configurada',
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = { authId: decoded.id };
    req.user = {
      id: decoded.id,
      email: decoded.email,
      ...decoded,
    };
    next();
  } catch (error) {
    return res.status(401).json({
      message: 'Invalid or expired token',
      error: error.message,
    });
  }
};

module.exports = {
  authenticateToken,
};
