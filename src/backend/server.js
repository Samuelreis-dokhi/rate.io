const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./config/db');

// carrega as variáveis de ambiente do arquivo .env
dotenv.config();

// iniciando o servidor express
const app = express();

// middleware iniciais
app.use(cors()); 
app.use(express.json());

// conectando ao banco de dados
connectDB(process.env.MONGO_URI_AUTH, 'auth');

// rota de teste inicial
app.get('/', (req, res) => {
  res.send('API rodando...');
});

// importando rotas de microsserviços
// app.use('/api/users', require('./routes/userRoutes'));
// app.use('/api/auth', require('./routes/authRoutes'));
// app.use('/api/expenses', require('./routes/expenseRoutes'));
// app.use('/api/groups', require('./routes/groupRoutes'));

// definindo a porta do servidor
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});

