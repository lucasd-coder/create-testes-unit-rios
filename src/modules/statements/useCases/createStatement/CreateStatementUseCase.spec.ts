import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateStatementError } from "./CreateStatementError";
import { CreateStatementUseCase } from "./CreateStatementUseCase";
import { ICreateStatementDTO } from "./ICreateStatementDTO";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let createStatementUseCase: CreateStatementUseCase;
let usersRepsositoryInMemory: InMemoryUsersRepository;

let authenticationUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('Create Statement', () => {
  beforeEach(() =>{
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepsositoryInMemory = new InMemoryUsersRepository();
    createStatementUseCase = new CreateStatementUseCase(usersRepsositoryInMemory ,statementsRepositoryInMemory);

    createUserUseCase = new CreateUserUseCase(usersRepsositoryInMemory);
    authenticationUserUseCase = new AuthenticateUserUseCase(usersRepsositoryInMemory);
  });

  it('should be able to register the deposit operation', async () => {
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

    const result = await createStatementUseCase.execute(deposit);

    expect(result).toHaveProperty('id');
    expect(result.type).toBe('deposit');
    expect(result.amount).toBe(500);
  });

  it('should not be able to create a deposit an non-existent user', async () => {
    expect(async () => {
     const deposit: ICreateStatementDTO = {
        user_id: 'not_found',
        amount: 7000,
        description: 'teste_123',
        type: 'deposit' as OperationType
      };
      await createStatementUseCase.execute(deposit);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it('should be able to register the withdraw operation', async () => {
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

    const result = await createStatementUseCase.execute(withdraw);

    expect(result).toHaveProperty('id');
    expect(result.type).toBe('withdraw');
    expect(result.amount).toBe(200);
  });

  it('should not be able to create a withdraw an non-existent user', async () => {
    expect(async () => {
     const withdraw: ICreateStatementDTO = {
        user_id: 'not_found',
        amount: 1000,
        description: 'teste_123',
        type: 'withdraw' as OperationType
      };
      await createStatementUseCase.execute(withdraw);
    }).rejects.toBeInstanceOf(CreateStatementError.UserNotFound)
  });

  it('should be able to create a withdraw with insufficient funds', async () => {
    expect(async () => {
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
        amount: 700,
        description: 'deposit test',
        type: 'deposit' as OperationType
      }

      await createStatementUseCase.execute(deposit);

      const withdraw: ICreateStatementDTO = {
        user_id: id,
        amount: 1000,
        description: 'deposit test',
        type: 'withdraw' as OperationType
      }

      await createStatementUseCase.execute(withdraw);
    }).rejects.toBeInstanceOf(CreateStatementError.InsufficientFunds)
  });

});

