const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { URL } = require('node:url');
const { connectDB } = require('./config/database');
const { authenticateToken } = require('./middleware/authMiddleware');
const path = require('node:path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const allowedOrigins = new Set(['https://rateio-app.onrender.com']);

const isLocalDevelopmentOrigin = (origin) => {
  try {
    const { hostname } = new URL(origin);
    return hostname === 'localhost' || hostname === '127.0.0.1';
  } catch {
    return false;
  }
};

/* Middleware */
app.use(
  cors({
    origin(origin, callback) {
      if (!origin || allowedOrigins.has(origin) || isLocalDevelopmentOrigin(origin)) {
        callback(null, true);
        return;
      }

      callback(new Error('Origem não permitida pelo CORS'));
    },
    credentials: true,
  })
);
app.use(express.json());
app.use(express.static(path.join(__dirname, 'uploads')));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Inicia o servidor e conecta ao MongoDB
const startServer = async () => {
  try {
    await connectDB();
    console.log('Conectado ao MongoDB com sucesso!');

    const Auth = require('./models/Auth');
    try {
      const indexes = await Auth.collection.indexes();
      const hasLegacyUsernameIndex = indexes.some((index) => index.name === 'username_1');

      if (hasLegacyUsernameIndex) {
        await Auth.collection.dropIndex('username_1');
        console.log('Índice antigo "username_1" removido com sucesso.');
      }
    } catch (indexError) {
      if (indexError?.codeName === 'IndexNotFound') {
        throw indexError;
      }
    }
    const authRoutes = require('./routes/authRoutes');
    const userRoutes = require('./routes/userRoutes');
    const groupRoutes = require('./routes/groupRoutes');
    const expenseRoutes = require('./routes/expenseRoutes');

    app.use('/api/auth', authRoutes);
    app.use('/api/users', authenticateToken, userRoutes);
    app.use('/api/groups', authenticateToken, groupRoutes);
    app.use('/api/expenses', authenticateToken, expenseRoutes);

    app.get('/', (req, res) => {
      res.send('API rodando...');
    });

    app.get('/health', (req, res) => {
      res.status(200).json({ status: 'ok' });
    });

    app.use((req, res) => {
      res.status(404).json({ message: 'Endpoint não encontrado' });
    });

    app.use((err, req, res, next) => {
      if (err.message === 'Formato de arquivo não suportado') {
        return res.status(400).json({ message: err.message })
      }

      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).json({ message: 'Arquivo maior que o limite permitido' })
      }

      next(err)
    });

    app.use((err, req, res) => {
      console.error('Erro no servidor:', err);
      res.status(500).json({ message: 'Erro interno do servidor' });
    });

    app.listen(PORT, () => {
      console.log(`Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    throw new Error(`Erro ao iniciar o servidor: ${error.message}`);
  }
};

startServer();
