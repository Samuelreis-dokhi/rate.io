const request = require('supertest');
const { createApp } = require('../helpers/app');

jest.setTimeout(20000);

let app;

beforeAll(() => {
  app = createApp();
});

const registerAndLogin = async ({ name, email, password }) => {
  const registerRes = await request(app).post('/api/auth/register').send({
    name,
    email,
    password,
  });

  expect(registerRes.status).toBe(201);

  const loginRes = await request(app).post('/api/auth/login').send({
    email,
    password,
  });

  expect(loginRes.status).toBe(200);
  expect(loginRes.body).toHaveProperty('token');

  return {
    userId: registerRes.body.id,
    token: loginRes.body.token,
    email,
    name,
  };
};

describe('System: jornada completa do usuário', () => {
  test('cadastro, login, grupo, despesa, quitação e saldo final', async () => {
    const unique = `${Date.now()}_${Math.floor(Math.random() * 100000)}`;
    const password = 'senha123';

    const userA = await registerAndLogin({
      name: 'Ana Journey',
      email: `ana_${unique}@teste.com`,
      password,
    });

    const userB = await registerAndLogin({
      name: 'Bruno Journey',
      email: `bruno_${unique}@teste.com`,
      password,
    });

    const profileRes = await request(app)
      .get('/api/users/profile')
      .set('Authorization', `Bearer ${userA.token}`);

    expect(profileRes.status).toBe(200);
    expect(profileRes.body.email).toBe(userA.email);
    expect(profileRes.body.name).toBe(userA.name);

    const createGroupRes = await request(app)
      .post('/api/groups')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        name: 'Viagem Floripa',
        description: 'Jornada E2E',
        createdBy: userA.userId,
      });

    expect(createGroupRes.status).toBe(201);
    expect(createGroupRes.body).toHaveProperty('_id');

    const groupId = createGroupRes.body._id;

    const addMemberRes = await request(app)
      .post(`/api/groups/${groupId}/members`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        userId: userB.userId,
        addedBy: userA.userId,
      });

    expect(addMemberRes.status).toBe(200);
    const memberInGroup = addMemberRes.body.members.find(
      (member) => String(member.userId) === String(userB.userId)
    );
    expect(memberInGroup).toBeDefined();

    const groupsByUserBRes = await request(app)
      .get(`/api/groups/user/${userB.userId}`)
      .set('Authorization', `Bearer ${userB.token}`);

    expect(groupsByUserBRes.status).toBe(200);
    expect(groupsByUserBRes.body.some((group) => String(group._id) === String(groupId))).toBe(true);

    const createExpenseRes = await request(app)
      .post('/api/expenses')
      .set('Authorization', `Bearer ${userA.token}`)
      .send({
        groupId,
        description: 'Hospedagem',
        amount: 120,
        currency: 'BRL',
        paidBy: userA.userId,
        createdBy: userA.userId,
        splitType: 'igual',
        splitsData: [{ userId: userA.userId }, { userId: userB.userId }],
      });

    expect(createExpenseRes.status).toBe(201);
    expect(createExpenseRes.body.expense).toHaveProperty('_id');

    const expenseId = createExpenseRes.body.expense._id;
    const userBSplitBefore = createExpenseRes.body.expense.splits.find(
      (split) => String(split.userId) === String(userB.userId)
    );

    expect(userBSplitBefore).toBeDefined();
    expect(userBSplitBefore.amount).toBe(60);
    expect(userBSplitBefore.status).toBe('pendente');

    const balancesBeforeSettleRes = await request(app)
      .get(`/api/expenses/group/${groupId}/balances?userId=${userA.userId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(balancesBeforeSettleRes.status).toBe(200);
    expect(balancesBeforeSettleRes.body.balance.netBalance).toBe(60);
    expect(balancesBeforeSettleRes.body.balance.summary).toBe('60 a receber');

    const settleRes = await request(app)
      .post(`/api/expenses/${expenseId}/settle`)
      .set('Authorization', `Bearer ${userB.token}`)
      .send({
        userId: userB.userId,
        paidBy: userB.userId,
      });

    expect(settleRes.status).toBe(200);

    const balancesAfterSettleRes = await request(app)
      .get(`/api/expenses/group/${groupId}/balances?userId=${userA.userId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(balancesAfterSettleRes.status).toBe(200);
    expect(balancesAfterSettleRes.body.balance.netBalance).toBe(0);
    expect(balancesAfterSettleRes.body.balance.summary).toBe('Saldo equilibrado');

    const expensesRes = await request(app)
      .get(`/api/expenses/group/${groupId}?userId=${userA.userId}`)
      .set('Authorization', `Bearer ${userA.token}`);

    expect(expensesRes.status).toBe(200);
    expect(Array.isArray(expensesRes.body.expenses)).toBe(true);
    expect(expensesRes.body.expenses.length).toBeGreaterThanOrEqual(1);

    const createdExpense = expensesRes.body.expenses.find(
      (expense) => String(expense._id) === String(expenseId)
    );
    expect(createdExpense).toBeDefined();

    const userBSplitAfter = createdExpense.splits.find(
      (split) => String(split.userId) === String(userB.userId)
    );
    expect(userBSplitAfter.status).toBe('pago');

    const activitiesRes = await request(app)
      .get(`/api/groups/${groupId}/activities`)
      .query({ userId: userA.userId })
      .set('Authorization', `Bearer ${userA.token}`);

    expect(activitiesRes.status).toBe(200);
    expect(Array.isArray(activitiesRes.body)).toBe(true);

    const activityTypes = activitiesRes.body.map((activity) => activity.type);
    expect(activityTypes).toEqual(
      expect.arrayContaining([
        'GROUP_CREATED',
        'MEMBER_ADDED',
        'EXPENSE_CREATED',
        'PAYMENT_SETTLED',
      ])
    );

    const deleteGroupRes = await request(app)
      .delete(`/api/groups/${groupId}`)
      .set('Authorization', `Bearer ${userA.token}`)
      .send({ userId: userA.userId });

    expect(deleteGroupRes.status).toBe(200);
  });
});
