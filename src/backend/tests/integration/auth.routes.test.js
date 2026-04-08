const request = require('supertest');
const { createApp } = require('../helpers/app');

let app;

beforeAll(() => {
  // O banco em memória e env já são configurados por tests/helpers/db.js via setupFilesAfterEnv
  app = createApp();
});

// ─── POST /api/auth/register ──────────────────────────────────────────
describe('POST /api/auth/register', () => {
  const validUser = {
    name: 'Maria Silva',
    email: 'maria@teste.com',
    password: 'senha123',
  };

  test('201: registra usuário com dados válidos', async () => {
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.email).toBe(validUser.email);
    expect(res.body.name).toBe(validUser.name);
    expect(res.body).not.toHaveProperty('password');
  });

  test('409: rejeita email duplicado', async () => {
    await request(app).post('/api/auth/register').send(validUser);
    const res = await request(app).post('/api/auth/register').send(validUser);

    expect(res.status).toBe(409);
    expect(res.body.error).toContain('já cadastrado');
  });

  test('400: valida payload obrigatório', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });
});

// ─── POST /api/auth/login ─────────────────────────────────────────────
describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send({
      name: 'João Teste',
      email: 'joao@teste.com',
      password: 'minha123',
    });
  });

  test('200: retorna JWT com credenciais válidas', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'joao@teste.com', password: 'minha123' });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.token.split('.')).toHaveLength(3);
  });

  test('401: rejeita senha inválida', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'joao@teste.com', password: 'errada' });

    expect(res.status).toBe(401);
  });
});
