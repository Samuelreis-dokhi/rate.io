const request = require('supertest');
const mongoose = require('mongoose');
const { createApp } = require('../helpers/app');

let app;

beforeAll(() => {
  app = createApp();
});

const createUserAndLogin = async (suffix = 'user') => {
  const unique = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
  const payload = {
    name: `User ${suffix}`,
    email: `user_${suffix}_${unique}@teste.com`,
    password: 'senha123',
  };

  const registerRes = await request(app).post('/api/auth/register').send(payload);
  const userId = registerRes.body.id;

  const loginRes = await request(app).post('/api/auth/login').send({
    email: payload.email,
    password: payload.password,
  });

  return { userId, token: loginRes.body.token, email: payload.email };
};

const createGroup = async (token, userId, overrides = {}) => {
  const res = await request(app)
    .post('/api/groups')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Grupo_${Date.now()}`,
      createdBy: userId,
      ...overrides,
    });

  expect(res.status).toBe(201);
  return res.body;
};

// ─── POST /api/groups ──────────────────────────────────────────
describe('POST /api/groups', () => {
  let token;
  let userId;

  beforeEach(async () => {
    ({ token, userId } = await createUserAndLogin());
  });

  test('201: cria grupo com nome válido', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Viagem SP', createdBy: userId, membersIds: [userId] });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('_id');
    expect(res.body.name).toBe('Viagem SP');

    const creatorMember = res.body.members.find((m) => String(m.userId) === String(userId));
    expect(creatorMember).toBeDefined();
    expect(creatorMember.role).toBe('admin');
  });

  test('400: rejeita nome vazio', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: '', createdBy: userId });

    expect(res.status).toBe(400);
  });

  test('400: rejeita nome com 1 caractere', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'A', createdBy: userId });

    expect(res.status).toBe(400);
  });

  test('400: rejeita nome com mais de 100 caracteres', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'A'.repeat(101), createdBy: userId });

    expect(res.status).toBe(400);
  });

  test('401: rejeita sem token', async () => {
    const res = await request(app).post('/api/groups').send({ name: 'Teste', createdBy: userId });
    expect(res.status).toBe(401);
  });

  test('400: rejeita sem ID do criador', async () => {
    const res = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${token}`)
      .send({ name: 'Grupo sem creator' });

    expect(res.status).toBe(400);
  });
});
