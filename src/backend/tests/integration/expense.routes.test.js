const request = require('supertest');
const mongoose = require('mongoose');
const { createApp } = require('../helpers/app');

let app;
/* A função beforeAll() já existe em helpers/app, basta que importemos a função */
beforeAll(async () => {
  app = createApp();
});
/* Cria um novo usuário mockado e loga */
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
/* Cria um grupo mockado para teste */
const createGroup = async (token, userId, overrides = {}) => {
  const res = await request(app)
    .post('/api/groups')
    .set('Authorization', `Bearer ${token}`)
    .send({
      name: `Grupo Teste ${Date.now()}`,
      createdBy: userId,
      ...overrides,
    });

  expect(res.status).tobe(201);
  return res.body;
};

// ─── POST /api/expenses ───────────────────────────────────────────────
describe('POST /api/expenses (createExpense)', () => {
  let token, userId, userId2, groupId;

  beforeEach(async () => {
    ({ token, userId } = await createUserAndLogin('A'));
    ({ userId: userId2 } = await createUserAndLogin('B'));
    const group = await createGroup(token, userId, [userId2]);
    groupId = group._id;
  });

  test('201: cria despesa com divisão igual', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Almoço',
        amount: 100,
        paidBy: userId,
        createdBy: userId,
        splitType: 'igual',
        splitsData: [{ userId }, { userId: userId2 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.expense).toHaveProperty('_id');
    expect(res.body.expense.splits).toHaveLength(2);

    const payerSplit = res.body.expense.splits.find((s) => s.userId === userId);
    expect(payerSplit.status).toBe('pago');

    const otherSplit = res.body.expense.splits.find((s) => s.userId === userId2);
    expect(otherSplit.status).toBe('pendente');
  });

  test('201: cria despesa com divisão exato', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Gasolina',
        amount: 100,
        paidBy: userId,
        createdBy: userId,
        splitType: 'exato',
        splitsData: [
          { userId, amount: 60 },
          { userId: userId2, amount: 40 },
        ],
      });

    expect(res.status).toBe(201);
    const split1 = res.body.expense.splits.find((s) => s.userId === userId);
    const split2 = res.body.expense.splits.find((s) => s.userId === userId2);
    expect(split1.amount).toBe(60);
    expect(split2.amount).toBe(40);
  });

  test('201: cria despesa com divisão por porcentagem', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Jantar',
        amount: 200,
        paidBy: userId,
        createdBy: userId,
        splitType: 'porcentagem',
        splitsData: [
          { userId, percentage: 60 },
          { userId: userId2, percentage: 40 },
        ],
      });

    expect(res.status).toBe(201);
    const split2 = res.body.expense.splits.find((s) => s.userId === userId2);
    expect(split2.amount).toBe(80);
  });

  test('400: rejeita sem campos obrigatórios', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({ groupId, amount: 100 });

    expect(res.status).toBe(400);
  });

  test('400: rejeita tipo de divisão inválido', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Teste',
        amount: 100,
        paidBy: userId,
        createdBy: userId,
        splitType: 'invalido',
        splitsData: [{ userId }],
      });

    expect(res.status).toBe(400);
  });

  test('400: rejeita porcentagens que não somam 100', async () => {
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Bar',
        amount: 100,
        paidBy: userId,
        createdBy: userId,
        splitType: 'porcentagem',
        splitsData: [
          { userId, percentage: 60 },
          { userId: userId2, percentage: 30 },
        ],
      });

    expect(res.status).toBe(400);
  });

  test('403: rejeita usuário fora do grupo', async () => {
    const { userId: outsider, token: outsiderToken } = await createUserAndLogin('C');
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({
        groupId,
        description: 'Invasão',
        amount: 50,
        paidBy: outsider,
        createdBy: outsider,
        splitType: 'igual',
        splitsData: [{ userId: outsider }],
      });

    expect(res.status).toBe(403);
  });

  test('403: rejeita split com usuário não-membro', async () => {
    const { userId: outsider } = await createUserAndLogin('D');
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Split inválido',
        amount: 100,
        paidBy: userId,
        createdBy: userId,
        splitType: 'igual',
        splitsData: [{ userId }, { userId: outsider }],
      });

    expect(res.status).toBe(403);
  });

  test('404: rejeita grupo inexistente', async () => {
    const fakeGroupId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId: fakeGroupId,
        description: 'Teste',
        amount: 50,
        paidBy: userId,
        createdBy: userId,
        splitType: 'igual',
        splitsData: [{ userId }],
      });

    expect(res.status).toBe(404);
  });

  test('401: rejeita sem token de autenticação', async () => {
    const res = await request(app).post('/api/expenses').send({ groupId });
    expect(res.status).toBe(401);
  });
});

// ─── GET /api/expenses/group/:groupId ─────────────────────────────────
describe('GET /api/expenses/group/:groupId', () => {
  let token, userId, groupId;

  beforeEach(async () => {
    ({ token, userId } = await createUserAndLogin('E'));
    const group = await createGroup(token, userId);
    groupId = group._id;

    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Despesa A',
        amount: 50,
        paidBy: userId,
        createdBy: userId,
        splitType: 'igual',
        splitsData: [{ userId }],
      });
  });

  test('200: retorna lista de despesas do grupo', async () => {
    const res = await request(app)
      .get(`/api/expenses/group/${groupId}?userId=${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.expenses)).toBe(true);
    expect(res.body.expenses.length).toBeGreaterThan(0);
  });

  test('200: despesas ordenadas por createdAt decrescente', async () => {
    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Despesa Antiga',
        amount: 30,
        paidBy: userId,
        createdBy: userId,
        splitType: 'igual',
        splitsData: [{ userId }],
      });

    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Despesa Nova',
        amount: 70,
        paidBy: userId,
        createdBy: userId,
        splitType: 'igual',
        splitsData: [{ userId }],
      });

    const res = await request(app)
      .get(`/api/expenses/group/${groupId}?userId=${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.expenses[0].description).toBe('Despesa Nova');
    expect(new Date(res.body.expenses[0].createdAt).getTime()).toBeGreaterThan(
      new Date(res.body.expenses[1].createdAt).getTime()
    );
  });

  test('400: IDs inválidos retornam erro', async () => {
    const res = await request(app)
      .get('/api/expenses/group/invalidId?userId=badUserId')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  test('403: rejeita usuário não-membro', async () => {
    const { userId: outsider, token: outsiderToken } = await createUserAndLogin('F');
    const res = await request(app)
      .get(`/api/expenses/group/${groupId}?userId=${outsider}`)
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(res.status).toBe(403);
  });

  test('404: grupo inexistente retorna 404', async () => {
    const fakeGroupId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/expenses/group/${fakeGroupId}?userId=${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});

// ─── POST /api/expenses/:expenseId/settle ─────────────────────────────
describe('POST /api/expenses/:expenseId/settle', () => {
  let token, userId, userId2, groupId, expenseId;

  beforeEach(async () => {
    ({ token, userId } = await createUserAndLogin('G'));
    ({ userId: userId2 } = await createUserAndLogin('H'));
    const group = await createGroup(token, userId, [userId2]);
    groupId = group._id;

    const expRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Despesa para quitar',
        amount: 100,
        paidBy: userId,
        createdBy: userId,
        splitType: 'igual',
        splitsData: [{ userId }, { userId: userId2 }],
      });

    expenseId = expRes.body.expense._id;
  });

  test('200: quita a parte de user2', async () => {
    const res = await request(app)
      .post(`/api/expenses/${expenseId}/settle`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: userId2, paidBy: userId2 });

    expect(res.status).toBe(200);
  });

  test('400: erro ao tentar quitar parte já paga', async () => {
    await request(app)
      .post(`/api/expenses/${expenseId}/settle`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: userId2, paidBy: userId2 });

    const res = await request(app)
      .post(`/api/expenses/${expenseId}/settle`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: userId2, paidBy: userId2 });

    expect(res.status).toBe(400);
  });

  test('400: requer userId e paidBy', async () => {
    const res = await request(app)
      .post(`/api/expenses/${expenseId}/settle`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: userId2 });

    expect(res.status).toBe(400);
  });

  test('400: IDs inválidos retornam erro', async () => {
    const res = await request(app)
      .post('/api/expenses/invalidId/settle')
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: 'invalidId', paidBy: userId2 });

    expect(res.status).toBe(400);
  });

  test('403: usuário não-membro não pode quitar parcela', async () => {
    const { userId: outsider, token: outsiderToken } = await createUserAndLogin('I');
    const res = await request(app)
      .post(`/api/expenses/${expenseId}/settle`)
      .set('Authorization', `Bearer ${outsiderToken}`)
      .send({ userId: outsider, paidBy: outsider });

    expect(res.status).toBe(403);
  });

  test('404: despesa inexistente retorna 404', async () => {
    const fakeExpenseId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .post(`/api/expenses/${fakeExpenseId}/settle`)
      .set('Authorization', `Bearer ${token}`)
      .send({ userId: userId2, paidBy: userId2 });

    expect(res.status).toBe(404);
  });
});

// ─── GET /api/expenses/group/:groupId/balances ────────────────────────
describe('GET /api/expenses/group/:groupId/balances', () => {
  let token, userId, userId2, groupId;

  beforeEach(async () => {
    ({ token, userId } = await createUserAndLogin('J'));
    ({ userId: userId2 } = await createUserAndLogin('K'));
    const group = await createGroup(token, userId, [userId2]);
    groupId = group._id;

    await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${token}`)
      .send({
        groupId,
        description: 'Pizza',
        amount: 100,
        paidBy: userId,
        createdBy: userId,
        splitType: 'igual',
        splitsData: [{ userId }, { userId: userId2 }],
      });
  });

  test('200: retorna saldo completo com totalPaid, totalOwed, netBalance e summary', async () => {
    const res = await request(app)
      .get(`/api/expenses/group/${groupId}/balances?userId=${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.balance).toHaveProperty('totalPaid');
    expect(res.body.balance).toHaveProperty('totalOwed');
    expect(res.body.balance).toHaveProperty('netBalance');
    expect(res.body.balance).toHaveProperty('summary');
    expect(res.body.balance.netBalance).toBe(50);
    expect(res.body.balance.totalPaid).toBe(50);
    expect(res.body.balance.totalOwed).toBe(0);
    expect(res.body.balance.summary).toBe('50 a receber');
  });

  test('403: usuário não-membro não pode ver balanços', async () => {
    const { userId: outsider, token: outsiderToken } = await createUserAndLogin('L');
    const res = await request(app)
      .get(`/api/expenses/group/${groupId}/balances?userId=${outsider}`)
      .set('Authorization', `Bearer ${outsiderToken}`);

    expect(res.status).toBe(403);
  });

  test('400: IDs inválidos retornam erro', async () => {
    const res = await request(app)
      .get('/api/expenses/group/invalidId/balances?userId=badUserId')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(400);
  });

  test('404: grupo inexistente retorna 404', async () => {
    const fakeGroupId = new mongoose.Types.ObjectId().toString();
    const res = await request(app)
      .get(`/api/expenses/group/${fakeGroupId}/balances?userId=${userId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
