import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";

let usersRepsositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {

  beforeEach(() => {
    usersRepsositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepsositoryInMemory);
  });

  it('should be able to create a new user', async () => {
      const user = await createUserUseCase.execute({
        name: 'lucas silva',
        email: 'lucasdasilva.com',
        password: '123456',
      });

      expect(user).toHaveProperty('id');
  });

  it('should not be able to create a new user with same email from another', async () => {
    usersRepsositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepsositoryInMemory);

    await createUserUseCase.execute({
      name: 'lucas silva',
      email: 'lucasdasilva.com',
      password: '123456',
    });

    await expect(
      createUserUseCase.execute({
        name: 'lucas silva',
        email: 'lucasdasilva.com',
        password: '123456',
        })
      ).rejects.toBeInstanceOf(CreateUserError);
  });

});
