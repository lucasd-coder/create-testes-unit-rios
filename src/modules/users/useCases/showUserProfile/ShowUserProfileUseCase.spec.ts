import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "../authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "../createUser/CreateUserUseCase";
import { ICreateUserDTO } from "../createUser/ICreateUserDTO";
import { ShowUserProfileError } from "./ShowUserProfileError";
import { ShowUserProfileUseCase } from "./ShowUserProfileUseCase";

let usersRepsositoryInMemory: InMemoryUsersRepository;
let showUserProfileUseCase: ShowUserProfileUseCase;
let authenticationUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;


describe('show Profile', () => {
  beforeEach(() => {
    usersRepsositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepsositoryInMemory);
    showUserProfileUseCase = new ShowUserProfileUseCase(usersRepsositoryInMemory);
    authenticationUserUseCase = new AuthenticateUserUseCase(usersRepsositoryInMemory);
  })

  it('should be able show the profile ', async () => {
    const user: ICreateUserDTO ={
      name: 'lucas silva',
      email: 'test123@test.com',
      password: '123456',
    }


    await createUserUseCase.execute(user);

    const userAuthetication = await authenticationUserUseCase.execute({
      email: user.email,
      password: user.password
    });
    const { id } = userAuthetication.user;

    const profile = await showUserProfileUseCase.execute(id);

    expect(profile).toHaveProperty('id');
    expect(profile.name).toBe(user.name);
    expect(profile.email).toBe(user.email);
  });

  it('should not be able show the profile from nonexistent', async () => {
    await expect(async() => {
      const id = 'no-existing-user_id';

      await showUserProfileUseCase.execute(id);
    }
    ).rejects.toBeInstanceOf(ShowUserProfileError)
  })
});
