import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetStatementOperationUseCase } from './GetStatementOperationUseCase';

let getStatementOperationUseCase: GetStatementOperationUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('GetStatementOperationUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();
    getStatementOperationUseCase = new GetStatementOperationUseCase(
      inMemoryUsersRepository,
      inMemoryStatementsRepository,
    );
  });

  it('should be able to get statement operation from a user', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'test-user',
      email: 'test@email.com',
      password: '123456',
    });

    const statement = await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      amount: 100.0,
      description: 'description',
      type: OperationType.DEPOSIT,
    });

    const foundStatement = await getStatementOperationUseCase.execute({
      user_id: user.id as string,
      statement_id: statement.id as string,
    });

    expect(foundStatement).toHaveProperty('id');
    expect(foundStatement.amount).toBe(statement.amount);
    expect(foundStatement.type).toBe(statement.type);
    expect(foundStatement.description).toBe(statement.description);
    expect(foundStatement.user_id).toBe(statement.user_id);
  });

  it('should not be able to get a inexistent statement operation from a user', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'test-user',
      email: 'test@email.com',
      password: '123456',
    });

    await expect(
      getStatementOperationUseCase.execute({
        user_id: user.id as string,
        statement_id: 'inexistent-user-id',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it('should not be able to get a statement operation from a inexistent user', async () => {
    await expect(
      getStatementOperationUseCase.execute({
        user_id: 'inexistent-user',
        statement_id: 'inexistent-user-id',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
