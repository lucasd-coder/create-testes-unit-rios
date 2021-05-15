import { send } from 'node:process';
import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Get user balance Controller', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show balance user', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'user lucas',
      email: 'lucasteste@test.com',
      password: '123456',
    });

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'lucasteste@test.com',
      password: '123456',
    });

    const { token } = responseToken.body;

     await request(app)
    .post('/api/v1/statements/deposit')
    .send({
      amount: 500,
      description: 'Deposit test superTest',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

     await request(app)
    .post('/api/v1/statements/withdraw')
    .send({
      amount: 200,
      description: 'Deposit test superTest',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    const response = await request(app)
    .get('/api/v1/statements/balance')
    .send()
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('balance');
    expect(response.body.balance).toEqual(300);
  });

  it('should not be able to list balance a non existent user', async () => {
    const response = await request(app)
    .get('/api/v1/statements/balance')
    .send()
    .set({
      Authorization: `Bearer not_found`,
    });

    expect(response.status).toBe(401);

  });

});
