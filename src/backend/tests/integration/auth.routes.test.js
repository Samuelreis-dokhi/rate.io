const request = require('supertest');
const jwt = require('jsonwebtoken');
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

  test('400: rejeita sem nome', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'semnome@teste.com', password: '123456' });

    expect(res.status).toBe(400);
  });

  test('400: rejeita sem email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Sem Email', password: '123456' });

    expect(res.status).toBe(400);
  });

  test('400: rejeita email inválido (sem @)', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Email Invalido', email: 'emailinvalido.com', password: '123456' });

    expect(res.status).toBe(400);
  });

  test('400: rejeita senha com menos de 6 caracteres', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Senha Curta', email: 'curta@teste.com', password: '12345' });

    expect(res.status).toBe(400);
  });

  test('400: rejeita sem corpo na requisição', async () => {
    const res = await request(app).post('/api/auth/register');
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

  test('401: rejeita email inexistente', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'naoexiste@teste.com', password: 'minha123' });

    expect(res.status).toBe(401);
  });

  test('400: rejeita sem email', async () => {
    const res = await request(app).post('/api/auth/login').send({ password: 'minha123' });
    expect(res.status).toBe(400);
  });

  test('400: rejeita sem senha', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'joao@teste.com' });
    expect(res.status).toBe(400);
  });
});

describe('Middleware authenticateToken', () => {
  test('401: rota protegida sem header Authorization', async () => {
    const res = await request(app).get('/api/users/profile');
    expect(res.status).toBe(401);
  });

  test('401: token malformado', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'Bearer token-malformado');

    expect(res.status).toBe(401);
  });

  test('401: sem prefixo Bearer', async () => {
    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', 'token-sem-bearer');
    expect(res.status).toBe(401);
  });

  test('401: token expirado', async () => {
    const expiredToken = jwt.sign(
      { id: '507f1f77bcf86cd799439011', email: 'expired@teste.com' },
      process.env.JWT_SECRET,
      { expiresIn: '0s' }
    );

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${expiredToken}`);

    expect(res.status).toBe(401);
  });

  test('200: token válido acessa rota protegida', async () => {
    // Registro cria credencial + perfil; login devolve token válido.
    await request(app).post('/api/auth/register').send({
      name: 'Token Valido',
      email: 'token.valido@teste.com',
      password: 'senha123',
    });

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: 'token.valido@teste.com', password: 'senha123' });

    const res = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${loginRes.body.token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('email', 'token.valido@teste.com');
  });
});
