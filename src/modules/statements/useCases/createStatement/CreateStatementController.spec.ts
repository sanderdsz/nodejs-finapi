import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;
let id: string;
let id2: string;

describe('CreateStatementController', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    id = uuidV4();
    id2 = uuidV4();
    const password = await hash('user123', 8);

    await connection.query(
      `INSERT INTO USERS(id, name, email, password) 
      VALUES('${id}', 'test-user', 'user@finapi.com.br', '${password}'),
      ('${id2}', 'test-user2', 'user2@finapi.com.br', '${password}');`,
    );
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it('should be able to create a deposit statement', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: 'user123',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post(`/api/v1/statements/deposit`)
      .send({
        amount: 100,
        description: 'description',
      })
      .set({ Authorization: `Bearer ${token}` });

    const { user_id, description, amount, type } = response.body;

    expect(response.status).toBe(201);
    expect(user_id).toBe(id);
    expect(description).toBe('description');
    expect(amount).toBe(100);
    expect(type).toBe('deposit');
  });

  it('should be able to create a withdraw statement with sufficient funds', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: 'user123',
    });

    const { token } = responseToken.body;

    await request(app)
      .post(`/api/v1/statements/deposit`)
      .send({
        amount: 100,
        description: 'description',
      })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app)
      .post(`/api/v1/statements/withdraw`)
      .send({
        amount: 100,
        description: 'description withdraw',
      })
      .set({ Authorization: `Bearer ${token}` });

    const { user_id, description, amount, type } = response.body;

    expect(response.status).toBe(201);
    expect(user_id).toBe(id);
    expect(description).toBe('description withdraw');
    expect(amount).toBe(100);
    expect(type).toBe('withdraw');
  });

  it('should be able to create a transfer statement with sufficient funds', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: 'user123',
    });

    const { token } = responseToken.body;

    await request(app)
      .post(`/api/v1/statements/deposit`)
      .send({
        amount: 100,
        description: 'description',
      })
      .set({ Authorization: `Bearer ${token}` });

    const response = await request(app)
      .post(`/api/v1/statements/transfers/${id2}`)
      .send({
        amount: 100,
        description: 'description transfer',
      })
      .set({ Authorization: `Bearer ${token}` });

    const { user_id, description, amount, type, sender_id } = response.body;

    expect(response.status).toBe(201);
    expect(user_id).toBe(id2);
    expect(sender_id).toBe(id);
    expect(description).toBe('description transfer');
    expect(amount).toBe(100);
    expect(type).toBe('transfers');
  });

  it('should not be able to create a withdraw statement with insufficient funds', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: 'user123',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post(`/api/v1/statements/withdraw`)
      .send({
        amount: 300,
        description: 'description withdraw',
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a transfer statement with insufficient funds', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: 'user123',
    });

    const { token } = responseToken.body;

    const response = await request(app)
      .post(`/api/v1/statements/transfers/${id2}`)
      .send({
        amount: 300,
        description: 'description transfer',
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(400);
  });

  it('should not be able to create a statement with inexistent user', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: 'user123',
    });

    const { token } = responseToken.body;

    await connection.query(
      "DELETE FROM users WHERE email='user@finapi.com.br'",
    );

    const response = await request(app)
      .post(`/api/v1/statements/deposit`)
      .send({
        amount: 100,
        description: 'description',
      })
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(404);
  });
});
