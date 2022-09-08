import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('ShowUserProfileController', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    const id = uuidV4();
    const password = await hash('user123', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password) 
      VALUES('${id}', 'test-user', 'user@finapi.com.br', '${password}')`,
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to show a user profile', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: 'user123',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .get(`/api/v1/profile`)
      .set({ Authorization: `Bearer ${token}` });

    const { name, email } = response.body;

    expect(response.status).toBe(200);
    expect(email).toBe('user@finapi.com.br');
    expect(name).toBe('test-user');
  });

  it('should not be able to show a user profile of inexistent user', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: 'user123',
    });

    const { token } = responseToken.body;

    await connection.query(
      "DELETE FROM users WHERE email='user@finapi.com.br'",
    );

    const response = await request(app)
      .get(`/api/v1/profile`)
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(404);
  });
});
