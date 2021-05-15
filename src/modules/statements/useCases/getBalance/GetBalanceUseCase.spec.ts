import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementUseCase } from "../createStatement/CreateStatementUseCase";
import { ICreateStatementDTO } from "../createStatement/ICreateStatementDTO";
import { GetBalanceError } from "./GetBalanceError";
import { GetBalanceUseCase } from "./GetBalanceUseCase";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepsositoryInMemory: InMemoryUsersRepository;
let authenticationUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let createStatementUseCase: CreateStatementUseCase;
let getBalanceUseCase: GetBalanceUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Get user balance', () => {

  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepsositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepsositoryInMemory ,statementsRepositoryInMemory);

    createUserUseCase = new CreateUserUseCase(usersRepsositoryInMemory);
    authenticationUserUseCase = new AuthenticateUserUseCase(usersRepsositoryInMemory);
    getBalanceUseCase = new GetBalanceUseCase(statementsRepositoryInMemory, usersRepsositoryInMemory);
  })

  it('should be able to show balance user', async () => {
    const user: ICreateUserDTO = {
      name: 'lucas silva',
      email: 'lucas@gmail.com',
      password: '123456',
    }

    await createUserUseCase.execute(user);

    const userAuthetication = await authenticationUserUseCase.execute({
      email: user.email,
      password: user.password
    });

    const { id } = userAuthetication.user;

    const deposit: ICreateStatementDTO = {
      user_id: id,
      amount: 500,
      description: 'deposit test',
      type: 'deposit' as OperationType
    }

    await createStatementUseCase.execute(deposit);

    const withdraw: ICreateStatementDTO = {
      user_id: id,
      amount: 200,
      description: 'deposit test',
      type: 'withdraw' as OperationType
    }

    await createStatementUseCase.execute(withdraw);

    const result = await getBalanceUseCase.execute({ user_id: id })

    expect(result.balance).toBe(300);
    expect(result.statement.length).toBe(2);
  });

  it('should not be able to list balance a non existent user', () => {
    expect(async() => {
      const user_id = "user_found";

      await getBalanceUseCase.execute({user_id});
    }).rejects.toBeInstanceOf(GetBalanceError);
  });
});
