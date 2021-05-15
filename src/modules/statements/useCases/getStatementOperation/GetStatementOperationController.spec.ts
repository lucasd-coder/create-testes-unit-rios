import { send } from 'node:process';
import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('List a Statement Controller', () => {

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to list statement ', async () => {
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

    const statement = await request(app)
    .post('/api/v1/statements/deposit')
    .send({
      amount: 500,
      description: 'Deposit test superTest',
    })
    .set({
      Authorization: `Bearer ${token}`,
    });

    const statement_id = statement.body.id as string;

    const response = await request(app)
    .get(`/api/v1/statements/${statement_id}`)
    .send()
    .set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('amount');
    expect(response.body.amount).toEqual('500.00');

  });
});
