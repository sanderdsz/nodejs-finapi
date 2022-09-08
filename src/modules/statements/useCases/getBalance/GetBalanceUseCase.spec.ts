import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../../users/repositories/in-memory/InMemoryUsersRepository';
import { InMemoryStatementsRepository } from '../../repositories/in-memory/InMemoryStatementsRepository';
import { GetBalanceUseCase } from './GetBalanceUseCase';

let getBalanceUseCase: GetBalanceUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;
let inMemoryStatementsRepository: InMemoryStatementsRepository;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('GetBalanceUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    inMemoryStatementsRepository = new InMemoryStatementsRepository();

    getBalanceUseCase = new GetBalanceUseCase(
      inMemoryStatementsRepository,
      inMemoryUsersRepository,
    );
  });

  it('should be able to get user balance', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'test-user',
      email: 'test@email.com',
      password: '123456',
    });

    await inMemoryStatementsRepository.create({
      user_id: user.id as string,
      amount: 100.0,
      description: 'description',
      type: OperationType.DEPOSIT,
    });

    const { balance, statement } = await getBalanceUseCase.execute({
      user_id: user.id as string,
    });

    expect(balance).toBe(100);
    expect(statement.length).toBe(1);
  });

  it('should not be able to get user balance with inexistent user', async () => {
    await expect(
      getBalanceUseCase.execute({
        user_id: 'inexistent-user-id',
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
