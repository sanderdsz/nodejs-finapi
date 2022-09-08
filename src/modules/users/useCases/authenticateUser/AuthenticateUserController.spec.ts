import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('AuthenticateUserController', () => {
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

  it('should be able to authenticate a user', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: 'user123',
    });

    const { user } = response.body;

    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(user.email).toBe('user@finapi.com.br');
    expect(user.name).toBe('test-user');
  });

  it('should not be able to authenticate a inexistent user email', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'inexistent-user@finapi.com.br',
      password: 'user123',
    });

    expect(response.status).toBe(401);
  });

  it('should not be able to authenticate a user with incorrect password', async () => {
    const response = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: 'incorrect-password',
    });

    expect(response.status).toBe(401);
  });
});
