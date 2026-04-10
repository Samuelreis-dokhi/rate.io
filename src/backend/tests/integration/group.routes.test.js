const request = require('supertest');
const { createApp } = require('../helpers/app'); 
const mongoose = require('mongoose');

let app;

beforeAll(() => {
  // O banco em memória e env já são configurados por tests/helpers/db.js via setupFilesAfterEnv
  app = createApp();
});

const createAndLoginUser = async (suffix) => {
  const payload = {
    name: `Test User ${suffix}`,
    email: `test${suffix}@example.com`,
    password: '123456',
};

const registerRes = await request(app).post('/api/auth/register').send(payload);
const userId = registerRes.body.id;

const loginRes = await request(app).post('/api/auth/login').send({
    email: payload.email,
    password: payload.password,
});

return { userId, token: loginRes.body.token, email: payload.email };
};
  
// ─── POST /api/groups ──────────────────────────────────────────
describe( 'POST /api/groups', () => {
  test('201: cria grupo com dados válidos', async () => {
    const creator = await createAndLoginUser('creator_ok');
    
     const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${creator.token}`)
        .send({ 
            name: 'Grupo Teste', 
            description: 'Descrição do grupo teste', 
            createdBy: creator.userId
        });

    expect(res.status).toBe(201);
    expect(res.body.name).toBe('Grupo Teste');
    expect(res.body.description).toBe('Descrição do grupo teste');
    expect(res.body.createdBy).toBe(creator.userId);
    expect(res.body.isActive).toBe(true);

    //criador deve aparecer como administrador
    const creatorMember = res.body.members.find((m) => String(m.user) === String(creator.userId));
    expect(creatorMember).toBeDefined();
    expect(creatorMember.role).toBe('admin');
  });

    test('400: rejeita sem nome', async () => {
    const creator = await createAndLoginUser('creator_no_name');
    
    const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${creator.token}`)
        .send({ 
            description: 'Descrição do grupo teste', 
            createdBy: creator.userId
        });

    expect(res.status).toBe(400);
  });

    test('400: rejeita nome com 1 caractere', async () => {
    const creator = await createAndLoginUser('creator_short_name');
    
    const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${creator.token}`)
        .send({ 
            name: 'A', 
            createdBy: creator.userId
        });

    expect(res.status).toBe(40);
  });       

test('400: rejeita nome com mais de 100 caracteres', async () => {
    const creator = await createAndLoginUser('creator_long_name');

    const res = await request(app)
        .post('/api/groups')
        .set('Authorization', `Bearer ${creator.token}`)
        .send({
            name: 'A'.repeat(101),
            createdBy: creator.userId
        });

    expect(res.status).toBe(400);
});

test('401: rejeita sem token', async () => {
    const creator = await createAndLoginUser('creator_no_token');
    const res = await request(app)
        .post('/api/groups')
        .send({
            name: 'Grupo sem token',
            createdBy: creator.userId
        });

    expect(res.status).toBe(401);
});

test('400: rejeita sem createdId', async () => {
    const creator = await createAndLoginUser('creator_no_createdBy');
    const res = await request(app)        .post('/api/groups')
        .set('Authorization', `Bearer ${creator.token}`)
        .send({
            name: 'Grupo sem createdBy'
        });

    expect(res.status).toBe(400);
});

}); 
