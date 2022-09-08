import { hash } from 'bcryptjs';
import request from 'supertest';
import { Connection } from 'typeorm';
import { v4 as uuidV4 } from 'uuid';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;
let id: string;

describe('GetBalanceController', () => {
  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();

    id = uuidV4();
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

  it('should be able to get user balance', async () => {
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
      .get('/api/v1/statements/balance')
      .set({ Authorization: `Bearer ${token}` });

    const { statement, balance } = response.body;

    expect(response.status).toBe(200);
    expect(statement.length).toBe(1);
    expect(balance).toBe(100);
  });

  it('should not be able to get balance of inexistent user', async () => {
    const responseToken = await request(app).post('/api/v1/sessions').send({
      email: 'user@finapi.com.br',
      password: 'user123',
    });

    const { token } = responseToken.body;

    await connection.query(
      "DELETE FROM users WHERE email='user@finapi.com.br'",
    );

    const response = await request(app)
      .get('/api/v1/statements/balance')
      .set({ Authorization: `Bearer ${token}` });

    expect(response.status).toBe(404);
  });
});
