import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepsositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let createUserUseCase: CreateUserUseCase;


describe('show Profile', () => {
  beforeEach(() => {
    usersRepsositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepsositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepsositoryInMemory);
  })

  it('should be able show the profile ', async () => {
    const user = await createUserUseCase.execute({
      name: 'lucas silva',
      email: 'lucasdasilva@test.com',
      password: '123456',
    });

    const profile = await showUserProfileUseCase.execute(user.id);

    expect(profile.name).toBe('lucas silva');
    expect(profile.email).toBe('lucasdasilva@test.com');
  });

  it('should not be able show the profile from nonexistent', async () => {
    await expect(
      showUserProfileUseCase.execute('no-existing-user_id')
    ).rejects.toBeInstanceOf(ShowUserProfileError)
  })
});
