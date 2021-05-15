import request from 'supertest';
import { Connection } from 'typeorm';
import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Show Profile Controller', () => {
  beforeAll( async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able show the profile', async () => {
    await request(app).post('/api/v1/users').send({
      name: 'show lucas',
      email: 'lucasprofile@gmail.com',
      password: '123456',
    });

    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'lucasprofile@gmail.com',
      password: '123456',
    });

    const { token } = responseToken.body;

    const response = await request(app).get('/api/v1/profile').send().set({
      Authorization: `Bearer ${token}`,
    });

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('id');
    expect(response.body.email).toEqual('lucasprofile@gmail.com');
  });

  it('should not be able show the profile from nonexistent', async () => {
    const response = await request(app).get('/api/v1/profile').send().set({
      Authorization: `Bearer not_found`,
    });

    expect(response.status).toBe(401);
  });
});
