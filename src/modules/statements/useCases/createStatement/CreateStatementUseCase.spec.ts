import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { CreateStatementUseCase } from './CreateStatementUseCase';

let createStatementUseCase: CreateStatementUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfers',
}

describe('CreateStatementUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    createStatementUseCase = new CreateStatementUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should be able to create a deposit statement', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'test-user',
      email: 'test@email.com',
      password: '123456',
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      description: 'description',
      amount: 100.0,
    });

    expect(statement).toHaveProperty('id');
    expect(statement.type).toBe(OperationType.DEPOSIT);
    expect(statement.description).toBe('description');
    expect(statement.amount).toBe(100.0);
  });

  it('should be able to create a withdraw statement with sufficient funds', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'test-user',
      email: 'test@email.com',
      password: '123456',
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      description: 'description',
      amount: 100.0,
    });

    const statement = await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.WITHDRAW,
      description: 'description withdraw',
      amount: 100.0,
    });

    expect(statement).toHaveProperty('id');
    expect(statement.type).toBe(OperationType.WITHDRAW);
    expect(statement.description).toBe('description withdraw');
    expect(statement.amount).toBe(100.0);
  });

  it('should be able to create a transfer statement with sufficient funds', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'test-user',
      email: 'test@email.com',
      password: '123456',
    });

    const user2 = await inMemoryUsersRepository.create({
      name: 'test-user2',
      email: 'test2@email.com',
      password: '123456',
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      description: 'description',
      amount: 100.0,
    });

    const statement = await createStatementUseCase.execute({
      user_id: user2.id as string,
      sender_id: user.id as string,
      type: OperationType.TRANSFER,
      description: 'description transfer',
      amount: 100.0,
    });

    expect(statement).toHaveProperty('id');
    expect(statement.type).toBe(OperationType.TRANSFER);
    expect(statement.description).toBe('description transfer');
    expect(statement.amount).toBe(100.0);
  });

  it('should not be able to create a withdraw statement with insufficient funds', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'test-user',
      email: 'test@email.com',
      password: '123456',
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      description: 'description',
      amount: 100.0,
    });

    await expect(
      createStatementUseCase.execute({
        user_id: user.id as string,
        type: OperationType.WITHDRAW,
        description: 'description withdraw',
        amount: 120.0,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a transfer statement with insufficient funds', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'test-user',
      email: 'test@email.com',
      password: '123456',
    });

    const user2 = await inMemoryUsersRepository.create({
      name: 'test-user2',
      email: 'test2@email.com',
      password: '123456',
    });

    await createStatementUseCase.execute({
      user_id: user.id as string,
      type: OperationType.DEPOSIT,
      description: 'description',
      amount: 100.0,
    });

    await expect(
      createStatementUseCase.execute({
        user_id: user2.id as string,
        sender_id: user.id as string,
        type: OperationType.TRANSFER,
        description: 'description transfer',
        amount: 120.0,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to create a deposit statement with inexistent user', async () => {
    await expect(
      createStatementUseCase.execute({
        user_id: 'non-existent-user',
        type: OperationType.DEPOSIT,
        description: 'description',
        amount: 100.0,
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
