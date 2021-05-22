import { User } from '@modules/users/entities/User';
import { ICreateUserDTO } from '@modules/users/useCases/createUser/ICreateUserDTO';
import request from 'supertest';
import { Connection } from 'typeorm';

import { app } from '../../../../app';
import createConnection from '../../../../database';

let connection: Connection;

describe('Operation Transfer Controller', () => {

  enum OperationType {
    DEPOSIT = 'deposit',
    WITHDRAW = 'withdraw',
  }

  interface ITokenUser {
    user: User,
    token: string,
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

  const userLucasSender: ICreateUserDTO = {
    name: "lucas User",
    email: "lucasr@test.com",
    password: "test123"
  }

  const userPedroReceiver: ICreateUserDTO = {
    name: "Pedro User",
    email: "pedro@test.com",
    password: "test123"
  }

  beforeAll(async () => {
    connection = await createConnection();
    await connection.runMigrations();
  });

  afterAll(async () => {
    await connection.dropDatabase();
    await connection.close();
  });

  it("should ne able to create a new transfer", async () => {

    await request(app).post("/api/v1/users").send(userLucasSender)
    await request(app).post("/api/v1/users").send(userPedroReceiver)

    const userSenderAuth = await request(app).post("/api/v1/sessions").send({
      email: userLucasSender.email,
      password: userLucasSender.password
    })

    const token = userSenderAuth.body.token

    const userReceiverAuth = await request(app).post("/api/v1/sessions").send({
      email: userPedroReceiver.email,
      password: userPedroReceiver.password
    })

    await request(app).post("/api/v1/statements/deposit")
    .send({
      amount: 500,
      description: statementData.description
    })
    .set({
      Authorization: `Bearer ${token}`,
    })

    const transfer = await request(app).post(`/api/v1/statements/transfer/${userReceiverAuth.body.user.id}`).send({
      amount: 50,
      description: "Test Transfer"
    }).set({
      Authorization: `Bearer ${token}`,
    })

    const balance = await request(app).get("/api/v1/statements/balance")
      .set({
        Authorization: `Bearer ${userSenderAuth.body.token}`,
      });

    expect(transfer.body.amount).toEqual(50)
    expect(transfer.body.description).toEqual("Test Transfer")
    expect(transfer.body).toHaveProperty("id")
    expect(transfer.body).toHaveProperty("sender_id")
    expect(transfer.body).toHaveProperty("transfer_id")

    expect(balance.body.balance).toEqual(500)


  });

  it("should no be able to create a new transfer if it is balance sender user below necessary", async () => {
    await request(app).post("/api/v1/users").send(userLucasSender)
    await request(app).post("/api/v1/users").send(userPedroReceiver)

    const userSenderAuth = await request(app).post("/api/v1/sessions").send({
      email: userLucasSender.email,
      password: userLucasSender.password
    })

    const token = userSenderAuth.body.token

    const userReceiverAuth = await request(app).post("/api/v1/sessions").send({
      email: userPedroReceiver.email,
      password: userPedroReceiver.password
    })

    const response = await request(app).post(`/api/v1/statements/transfer/${userReceiverAuth.body.user.id}`).send({
      amount: 3000,
      description: "Test Transfer"
    }).set({
      Authorization: `Bearer ${token}`,
    })

    expect(response.body.message).toEqual('Insufficient funds')

  })



});
