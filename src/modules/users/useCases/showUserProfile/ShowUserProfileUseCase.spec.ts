import { AppError } from '../../../../shared/errors/AppError';
import { InMemoryUsersRepository } from '../../repositories/in-memory/InMemoryUsersRepository';
import { ShowUserProfileUseCase } from './ShowUserProfileUseCase';

let showUserProfileUseCase: ShowUserProfileUseCase;
let inMemoryUsersRepository: InMemoryUsersRepository;

describe('ShowUserProfileUseCase', () => {
  beforeEach(() => {
    inMemoryUsersRepository = new InMemoryUsersRepository();
    showUserProfileUseCase = new ShowUserProfileUseCase(
      inMemoryUsersRepository,
    );
  });

  it('should be able to show a user profile of a existing user', async () => {
    const user = await inMemoryUsersRepository.create({
      name: 'test-user',
      email: 'test@email.com',
      password: '123456',
    });

    const userProfile = await showUserProfileUseCase.execute(user.id as string);

    expect(userProfile).toHaveProperty('id');
    expect(userProfile.name).toBe('test-user');
    expect(userProfile.email).toBe('test@email.com');
  });

  it('should not be able to show a user profile of a nonexisting user', async () => {
    await expect(
      showUserProfileUseCase.execute('non-existing-user-id'),
    ).rejects.toBeInstanceOf(AppError);
  });
});
