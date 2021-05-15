import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserError } from "./CreateUserError";
import { CreateUserUseCase } from "./CreateUserUseCase";
import { ICreateUserDTO } from "./ICreateUserDTO";

let usersRepsositoryInMemory: InMemoryUsersRepository;
let createUserUseCase: CreateUserUseCase;

describe('Create User', () => {

  beforeEach(() => {
    usersRepsositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepsositoryInMemory);
  });

  it('should be able to create a new user', async () => {
      const user: ICreateUserDTO = {
        name: 'lucas',
        email: 'lucas@gmail.com',
        password: '123456',
      }

      await createUserUseCase.execute(user);

      const userCreated = await usersRepsositoryInMemory.findByEmail(user.email)

      expect(userCreated).toHaveProperty('id');
  });

  it('should not be able to create a new user with same email from another', async () => {
    expect(async () => {
      const user: ICreateUserDTO = {
        name: 'lucas2',
        email: 'lucas2@test.com',
        password: '12345'
      }

      await createUserUseCase.execute(user);

      await createUserUseCase.execute(user);
    }).rejects.toBeInstanceOf(CreateUserError);
  });

});
