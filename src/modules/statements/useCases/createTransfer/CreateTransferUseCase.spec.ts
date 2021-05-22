import { InMemoryStatementsRepository } from "@modules/statements/repositories/in-memory/InMemoryStatementsRepository";
import { InMemoryTransferRepository } from "@modules/statements/repositories/in-memory/inMemoryTransferRepository";
import { InMemoryUsersRepository } from "@modules/users/repositories/in-memory/InMemoryUsersRepository";
import { CreateUserUseCase } from "@modules/users/useCases/createUser/CreateUserUseCase";
import { ICreateUserDTO } from "@modules/users/useCases/createUser/ICreateUserDTO";
import { CreateTransferError } from "./CreateTransferError";
import { CreateTransferUseCase } from "./CreateTransferUseCase";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

describe('Operation Transfer', () => {
  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  interface ICreateStatementDTO {
    user_id: string;
    amount: number;
    description: string;
    type: OperationType
  }

  const statementData: ICreateStatementDTO = {
    user_id: "",
    amount: 0,
    description: "Statement Test",
    type: OperationType.DEPOSIT
  }

  const userDataSender: ICreateUserDTO = {
    name: "Sender User",
    email: "lucas@test.com",
    password: "test123"
  }

  const userDataReceiver: ICreateUserDTO = {
    name: "Receiver User",
    email: "pedro@test.com",
    password: "test123"
  }

  let usersRepositoryInMemory: InMemoryUsersRepository
  let statementsRepositoryInMemory: InMemoryStatementsRepository
  let transfersRepositoryInMemory: InMemoryTransferRepository
  let createUserUseCase: CreateUserUseCase
  let createTransferUseCase: CreateTransferUseCase

  beforeEach(() => {
    usersRepositoryInMemory = new InMemoryUsersRepository()
    transfersRepositoryInMemory = new InMemoryTransferRepository()
    statementsRepositoryInMemory = new InMemoryStatementsRepository(transfersRepositoryInMemory)
    createUserUseCase = new CreateUserUseCase(usersRepositoryInMemory)
    createTransferUseCase = new CreateTransferUseCase(
      usersRepositoryInMemory,
      statementsRepositoryInMemory,
      transfersRepositoryInMemory
    )
  });

  it('should not be able to create a transfer an non-existent user', async () => {
    expect(async () => {
      const withdraw: ICreateTransferDTO = {
         id: 'not_found',
         amount: 1000,
         sender_id: 'not_found',
         description: 'teste_123',
       };
       await createTransferUseCase.execute(withdraw);
     }).rejects.toBeInstanceOf(CreateTransferError.UserNotFound);
  });

  it("should ne able to create a new transfer", async () => {
    const userSender = await createUserUseCase.execute(userDataSender)
    const userReceiver = await createUserUseCase.execute(userDataReceiver)

    await statementsRepositoryInMemory.create({
      ...statementData,
      user_id: userSender.id,
      amount: 5000
    })

    const transfer = await createTransferUseCase.execute({
      id: userSender.id,
      sender_id: userReceiver.id,
      amount: 3000,
      description: "Test Transfer"
    })

    expect(transfer.id).toBe(userSender.id)
    expect(transfer.sender_id).toBe(userReceiver.id)
    expect(transfer.amount).toBe(3000)
    expect(transfer.description).toBe("Test Transfer")
  })

  it("the balance must correspond to the transfer made", async () => {
    const userSender = await createUserUseCase.execute(userDataSender)
    const userReceiver = await createUserUseCase.execute(userDataReceiver)

    await statementsRepositoryInMemory.create({
      ...statementData,
      user_id: `${userSender.id}`,
      amount: 5000,
    })

   const transfer = await createTransferUseCase.execute({
      id: `${userSender.id}`,
      sender_id: `${userReceiver.id}`,
      amount: 3000,
      description: "Test Transfer"
    });

    expect(transfer.amount).toBe(3000)

  })

  it("should no be able to create a new transfer if it is balance sender user below necessary ", async () => {
    const userSender = await createUserUseCase.execute(userDataSender)
    const userReceiver = await createUserUseCase.execute(userDataReceiver)

    await expect(async () => await createTransferUseCase.execute({
      id: userSender.id,
      sender_id: userReceiver.id,
      amount: 3000,
      description: "Test Transfer"
    })).rejects.toBeInstanceOf(CreateTransferError.InsufficientFunds)

  })
});
