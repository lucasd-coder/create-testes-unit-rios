import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Authenticate User Controller', () => {
  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();
  })

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to authenticate an user', async () => {

    await request(app).post('/api/v1/users').send({
      name: 'user lucas',
      email: 'lucasteste@test.com',
      password: '123456',
    });

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'lucasteste@test.com',
      password: '123456',
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
  });

  it('should not be able to authenticate an nonexistent user', async () => {
    const response= await request(app).post('/api/v1/sessions').send({
      email: 'test@test.com',
      password: '123456',
    });

    expect(response.status).toBe(401);

  });

  it('should not be able to authenticate with incorrect email or password', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'user lucas3',
      email: 'lucasteste2@test.com',
      password: '123456',
    });

    const response = await request(app).post('/api/v1/sessions').send({
      email: 'lucasteste2@test.com',
      password: 'testIncorrectPassword',
    });

    expect(response.status).toBe(401);

  });



});
