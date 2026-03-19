// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        // Verificar se o header Authorization existe
        const authHeader = req.headers.authorization;
        
        if (!authHeader) {
            return res.status(401).json({ 
                message: 'Token não fornecido',
                error: 'AUTH_TOKEN_MISSING'
            });
        }

        // Verificar formato do token (Bearer token)
        const parts = authHeader.split(' ');
        
        if (parts.length !== 2) {
            return res.status(401).json({ 
                message: 'Erro no formato do token',
                error: 'AUTH_TOKEN_FORMAT_INVALID'
            });
        }

        const [scheme, token] = parts;

        // Verificar se o scheme é "Bearer"
        if (!/^Bearer$/i.test(scheme)) {
            return res.status(401).json({ 
                message: 'Formato de token inválido',
                error: 'AUTH_TOKEN_SCHEME_INVALID'
            });
        }

        // Verificar e decodificar o token
        jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
            if (err) {
                // Token expirado
                if (err.name === 'TokenExpiredError') {
                    return res.status(401).json({ 
                        message: 'Token expirado',
                        error: 'AUTH_TOKEN_EXPIRED'
                    });
                }
                
                // Token inválido
                if (err.name === 'JsonWebTokenError') {
                    return res.status(401).json({ 
                        message: 'Token inválido',
                        error: 'AUTH_TOKEN_INVALID'
                    });
                }

                // Outros erros de token
                return res.status(403).json({ 
                    message: 'Falha na autenticação',
                    error: 'AUTH_FAILED'
                });
            }

            // Anexar informações do usuário à requisição
            req.user = {
                id: decoded.id,
                email: decoded.email,
                role: decoded.role,
                // Adicione outros campos conforme necessário
                ...decoded
            };

            return next();
        });

    } catch (error) {
        console.error('Erro no middleware de autenticação:', error);
        return res.status(500).json({ 
            message: 'Erro interno do servidor',
            error: 'INTERNAL_SERVER_ERROR'
        });
    }
};

module.exports = authMiddleware;