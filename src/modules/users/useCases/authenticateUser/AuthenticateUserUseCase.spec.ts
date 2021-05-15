import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { AuthenticateUserUseCase } from "./AuthenticateUserUseCase";
import { IncorrectEmailOrPasswordError } from "./IncorrectEmailOrPasswordError";

let usersRepsositoryInMemory: InMemoryUsersRepository;
let authenticationUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

describe('Authenticate User', () => {
  beforeEach(() => {
    usersRepsositoryInMemory = new InMemoryUsersRepository();
    authenticationUserUseCase = new AuthenticateUserUseCase(usersRepsositoryInMemory);
    createUserUseCase = new CreateUserUseCase(usersRepsositoryInMemory);
  });

  it('should be able to authenticate an user', async () => {
    const user: ICreateUserDTO = {
      name: 'joão silva',
      email: 'joão@test.com',
      password: '123456',
    }

    await createUserUseCase.execute(user);

    const result = await authenticationUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    expect(result).toHaveProperty('token');
  });

  it('should not be able to authenticate an nonexistent user', () => {
    expect(async () => {
      await authenticationUserUseCase.execute({
        email: 'false@email.com',
        password: '1234',
      });
    }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  });

  it('should not be able to authenticate with incorrect email or password', async () => {
        expect(async () => {
          const user: ICreateUserDTO = {
            name: 'maria silva',
            email: 'maria@test.com',
            password: '123456',
          };

          await createUserUseCase.execute(user);

          await authenticationUserUseCase.execute({
            email: user.email,
            password:  'incorrectPassword'
          });
        }).rejects.toBeInstanceOf(IncorrectEmailOrPasswordError);
  })
});
