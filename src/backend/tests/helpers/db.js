/* setup/teardown do banco de testes */
const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server'); // Cria uma instância real com um banco Mongo in-memory, sem acessar o ambiente de produção

let mongod;

/* Antes de todos os testes, inicia o banco em memória */
beforeAll(async () => {
  mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();

  // Sobrescreve as coneções para apontar ao banco em memória
  process.env.MONGO_URI = uri;
  process.env.MONGO_URI_AUTH = uri;
  process.env.MONGO_URI_USERS = uri;
  process.env.MONGO_URI_EXPENSES = uri;
  process.env.MONGO_URI_GROUPS = uri;
  process.env.JWT_SECRET = 'test-secret-key-for-jest';
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
});
