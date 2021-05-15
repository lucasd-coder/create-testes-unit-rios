import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { AuthenticateUserUseCase } from "@modules/users/useCases/authenticateUser/AuthenticateUserUseCase";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { GetStatementOperationError } from "./GetStatementOperationError";
import { GetStatementOperationUseCase } from "./GetStatementOperationUseCase";

let statementsRepositoryInMemory: InMemoryStatementsRepository;
let usersRepsositoryInMemory: InMemoryUsersRepository;
let authenticationUserUseCase: AuthenticateUserUseCase;
let createUserUseCase: CreateUserUseCase;
let getStatementOperation: GetStatementOperationUseCase;

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
}

describe('list a statement', () => {

  beforeEach(() => {
    statementsRepositoryInMemory = new InMemoryStatementsRepository();
    usersRepsositoryInMemory = new InMemoryUsersRepository();
    createUserUseCase = new CreateUserUseCase(usersRepsositoryInMemory);
    authenticationUserUseCase = new AuthenticateUserUseCase(usersRepsositoryInMemory);
    getStatementOperation = new GetStatementOperationUseCase(usersRepsositoryInMemory, statementsRepositoryInMemory);

  })
  it('should be able to list statement ', async () => {
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

    const statement = await statementsRepositoryInMemory.create({
      user_id: id,
      amount: 500,
      description: 'deposit test',
      type: 'deposit' as OperationType
    });

    const statement_id = statement.id as string;

    const result = await getStatementOperation.execute({ user_id: id, statement_id});

    expect(result).toHaveProperty('type');
    expect(result.amount).toBe(500);
    expect(result).toHaveProperty('id');
  });

  it('should not be able to list balance a non existent user', () => {
    expect(async() => {
      const user_id = "user_found";

      const statement = await statementsRepositoryInMemory.create({
        user_id,
        amount: 500,
        description: 'deposit test',
        type: 'deposit' as OperationType
      });

      const statement_id = statement.id as string;

      await getStatementOperation.execute({user_id, statement_id});
    }).rejects.toBeInstanceOf(GetStatementOperationError.UserNotFound);
  });

  it('should not be able to view a non existent statement', () => {
      expect(async() => {
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

        const statement_id = 'user_found';

        await getStatementOperation.execute({user_id: id, statement_id});
      }).rejects.toBeInstanceOf(GetStatementOperationError.StatementNotFound);
  });

});
