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

// ─── POST /api/groups/:groupId/members ──────────────────────────
describe('POST /api/groups/:groupId/members', () => {
  let token;
  let userId;
  let userId2;
  let groupId;

  beforeEach(async () => {
    ({ token, userId } = await createUserAndLogin('A'));
    ({ userId: userId2 } = await createUserAndLogin('B'));
    const group = await createGroup(token, userId, { name: 'Grupo Add Member' });
    groupId = group._id;
  });

  test('200: adiciona membro ao grupo', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: userId2, addedBy: userId });

    expect(res.status).toBe(200);

    const addedMember = res.body.members.find((m) => String(m.userId) === String(userId2));
    expect(addedMember).toBeDefined();
    expect(addedMember.role).toBe('member');
  });

  test('404: rejeita grupo inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .post(`/api/groups/${fakeId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: userId2, addedBy: userId });

    expect(res.status).toBe(404);
  });

  test('400: rejeita userId inválido', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: 'nao-e-um-id-valido', addedBy: userId });

    expect(res.status).toBe(400);
  });

  test('400: rejeita usuário já membro (evita duplicata)', async () => {
    await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: userId2, addedBy: userId });

    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: userId2, addedBy: userId });

    expect(res.status).toBe(400);
    expect(res.body.message).toContain('já é membro');
  });

  test('401: rejeita sem token', async () => {
    const res = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .send({ userId: userId2, addedBy: userId });

    expect(res.status).toBe(401);
  });
});

// ─── GET /api/groups/user/:userId ──────────────────────────────
describe('GET /api/groups/user/:userId', () => {
  let token;
  let userId;

  beforeEach(async () => {
    ({ token, userId } = await createUserAndLogin());
    await createGroup(token, userId, { name: 'Grupo A1' });
    await createGroup(token, userId, { name: 'Grupo A2' });
  });

  test('200: lista os grupos do usuário', async () => {
    const res = await request(app)
      .get(`/api/groups/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(2);

    res.body.forEach((group) => {
      const isMember = group.members.some((m) => String(m.userId) === String(userId));
      expect(isMember).toBe(true);
    });
  });

  test('200: retorna array vazio se usuário não tem grupos', async () => {
    const { token: token2, userId: userId2 } = await createUserAndLogin('sem_grupo');

    const res = await request(app)
      .get(`/api/groups/user/${userId2}`)
      .set('Authorization', `Bearer ${token2}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body).toHaveLength(0);
  });

  test('401: rejeita sem token', async () => {
    const res = await request(app).get(`/api/groups/user/${userId}`);
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/groups/:groupId/activities ──────────────────────
describe('GET /api/groups/:groupId/activities', () => {
  let token;
  let userId;
  let groupId;

  beforeEach(async () => {
    ({ token, userId } = await createUserAndLogin());
    const group = await createGroup(token, userId, { name: 'Grupo Atividades' });
    groupId = group._id;
  });

  test('200: retorna atividades do grupo', async () => {
    const res = await request(app)
      .get(`/api/groups/${groupId}/activities`)
      .query({ userId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  test('200: atividade EXPENSE_CREATED aparece após criar despesa', async () => {
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Almoço em grupo',
        amount: 150.5,
        currency: 'BRL',
        paidBy: userId,
        createdBy: userId,
        splitType: 'igual',
        splitsData: [{ userId }],
      });

    const res = await request(app)
      .get(`/api/groups/${groupId}/activities`)
      .query({ userId })
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);

    const expenseActivity = res.body.find((a) => a.type === 'EXPENSE_CREATED');
    expect(expenseActivity).toBeDefined();
    expect(expenseActivity.message).toContain('adicionou uma despesa');
  });

  test('401: rejeita sem token', async () => {
    const res = await request(app).get(`/api/groups/${groupId}/activities`).query({ userId });
    expect(res.status).toBe(401);
  });
});

// ─── DELETE /api/groups/:groupId ───────────────────────────────
describe('DELETE /api/groups/:groupId', () => {
  let token;
  let userId;
  let groupId;

  beforeEach(async () => {
    ({ token, userId } = await createUserAndLogin());
    const group = await createGroup(token, userId, { name: 'Grupo para Deletar' });
    groupId = group._id;
  });

  test('200: deleta (desativa) grupo existente', async () => {
    const res = await request(app)
      .delete(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId });

    expect(res.status).toBe(200);
  });

  test('200: grupo desativado não aparece em pesquisas futuras', async () => {
    await request(app)
      .delete(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId });

    const groupsRes = await request(app)
      .get(`/api/groups/user/${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(groupsRes.status).toBe(200);
    expect(groupsRes.body.some((g) => String(g._id) === String(groupId))).toBe(false);
  });

  test('404: erro ao deletar grupo inexistente', async () => {
    const fakeId = new mongoose.Types.ObjectId().toString();

    const res = await request(app)
      .delete(`/api/groups/${fakeId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId });

    expect(res.status).toBe(404);
  });

  test('401: rejeita sem token', async () => {
    const res = await request(app).delete(`/api/groups/${groupId}`).send({ userId });
    expect(res.status).toBe(401);
  });
});
