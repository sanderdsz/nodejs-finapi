import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from '../createUser/CreateUserUseCase';
import { AuthenticateUserUseCase } from './AuthenticateUserUseCase';

let authenticateUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('AuthenticateUserUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
    authenticateUserUseCase = new AuthenticateUserUseCase(
      inMemoryUsersRepository,
    );
  });

  it('should be able to authenticate an existing user', async () => {
    await createUserUseCase.execute({
      name: 'test-user',
      email: 'test@email.com',
      password: '123456',
    });

    const response = await authenticateUserUseCase.execute({
      email: 'test@email.com',
      password: '123456',
    });

    expect(response).toHaveProperty('token');
    expect(response).toHaveProperty('user');
    expect(response.user.name).toBe('test-user');
    expect(response.user.email).toBe('test@email.com');
  });

  it('should not be able to authenticate an nonexistent user', async () => {
    await expect(
      authenticateUserUseCase.execute({
        email: 'test@email.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should be able to authenticate an user with incorrect password', async () => {
    await createUserUseCase.execute({
      name: 'test-user',
      email: 'test@email.com',
      password: '123456',
    });

    await expect(
      authenticateUserUseCase.execute({
        email: 'test@email.com',
        password: '12345678',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
