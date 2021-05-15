import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Create Statement Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    await request(app).post('/api/v1/users').send({
      name: 'user lucas',
      email: 'lucasteste@test.com',
      password: '123456',
    });
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to register the deposit operation', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'lucasteste@test.com',
      password: '123456',
    });

    const { token } = responseToken.body;

    const response = await request(app)
    .post('/api/v1/statements/deposit')
    .send({
      amount: 500,
      description: 'Deposit test superTest',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(500);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to create a deposit an non-existent user', async () => {
    const response = await request(app)
    .post('/api/v1/statements/deposit')
    .send({
      amount: 500,
      description: 'Deposit test superTest',
    })
    .set({
      Authorization: 'Bearer not_found',
    });

    expect(response.status).toBe(401);
  });

  it('should be able to register the withdraw operation', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'lucasteste@test.com',
      password: '123456',
    });

    const { token } = responseToken.body;

    const response = await request(app)
    .post('/api/v1/statements/withdraw')
    .send({
      amount: 200,
      description: 'Deposit test superTest',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(201);
    expect(response.body.amount).toBe(200);
    expect(response.body).toHaveProperty('id');
  });

  it('should not be able to create a withdraw an non-existent user', async () => {
    const response = await request(app)
    .post('/api/v1/statements/withdraw')
    .send({
      amount: 200,
      description: 'Deposit test superTest',
    })
    .set({
      Authorization: 'Bearer not_found',
    });

    expect(response.status).toBe(401);
  });

  it('should be able to create a withdraw with insufficient funds', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'lucasteste@test.com',
      password: '123456',
    });

    const { token } = responseToken.body;

    const response = await request(app)
    .post('/api/v1/statements/withdraw')
    .send({
      amount: 1000,
      description: 'Deposit test superTest',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(400);
  });



});
