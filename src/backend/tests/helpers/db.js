/* setup/teardown do banco de testes */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server'); // Cria uma instância real com um banco Mongo in-memory, sem acessar o ambiente de produção
const { connectDB } = require('../../config/database');

let mongod;
let previousEnv = null;

/* Antes de todos os testes, inicia o banco em memória */
beforeAll(async () => {
  // Guarda um snapshot do ambiente para restaurar após a suíte.
  previousEnv = {
    MONGO_URI: process.env.MONGO_URI,
    MONGO_URI_AUTH: process.env.MONGO_URI_AUTH,
    MONGO_URI_USERS: process.env.MONGO_URI_USERS,
    MONGO_URI_EXPENSES: process.env.MONGO_URI_EXPENSES,
    MONGO_URI_GROUPS: process.env.MONGO_URI_GROUPS,
    JWT_SECRET: process.env.JWT_SECRET,
  };

  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Sobrescreve as conexões para apontar ao banco em memória
  process.env.MONGO_URI = uri;
  process.env.MONGO_URI_AUTH = uri;
  process.env.MONGO_URI_USER = uri;
  process.env.MONGO_URI_EXPENSES = uri;
  process.env.MONGO_URI_GROUPS = uri;
  process.env.JWT_SECRET = 'test-secret-key-for-jest';

  // Garante que os models encontrem conexões válidas ao carregar as rotas.
  await connectDB();
});

/* Limpa todas as coleções entre testes */
afterEach(async () => {
  const collections = mongoose.connections.flatMap((conn) => Object.values(conn.collections));

  for (const collection of collections) {
    await collection.deleteMany({});
  }
});

// Fecha tudo ao finalizar
afterAll(async () => {
  await Promise.all(mongoose.connections.map((c) => c.close()));
  if (mongod) await mongod.stop();

  // Restaura o ambiente original do processo de testes.
  if (previousEnv) {
    process.env.MONGO_URI = previousEnv.MONGO_URI;
    process.env.MONGO_URI_AUTH = previousEnv.MONGO_URI_AUTH;
    process.env.MONGO_URI_USERS = previousEnv.MONGO_URI_USERS;
    process.env.MONGO_URI_EXPENSES = previousEnv.MONGO_URI_EXPENSES;
    process.env.MONGO_URI_GROUPS = previousEnv.MONGO_URI_GROUPS;
    process.env.JWT_SECRET = previousEnv.JWT_SECRET;
  }
});
