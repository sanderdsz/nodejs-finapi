import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { CreateUserUseCase } from './CreateUserUseCase';

let createUserUseCase: CreateUserUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('Create user use case', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(inMemoryUsersRepository);
  });

  it('should be able to create a user', async () => {
    const user = await createUserUseCase.execute({
      name: 'test user',
      email: 'user@email.com',
      password: '123456',
    });

    expect(user).toHaveProperty('id');
    expect(user.name).toBe('test user');
    expect(user.email).toBe('user@email.com');
  });

  it('should not be able to create a user with existent email', async () => {
    await createUserUseCase.execute({
      name: 'test user',
      email: 'user@email.com',
      password: '123456',
    });

    await expect(
      createUserUseCase.execute({
        name: 'test user 2',
        email: 'user@email.com',
        password: '123456',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
