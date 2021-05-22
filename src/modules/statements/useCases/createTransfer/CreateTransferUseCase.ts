import { inject, injectable } from "tsyringe";

import { Transfer } from "@modules/statements/entities/Transfer";
import { ITransfersRepository } from "@modules/statements/repositories/ ITransferRepository";
import { IStatementsRepository } from "@modules/statements/repositories/IStatementsRepository";
import { IUsersRepository } from "@modules/users/repositories/IUsersRepository";
import { CreateTransferError } from "./CreateTransferError";
import { ICreateTransferDTO } from "./ICreateTransferDTO";

@injectable()
class CreateTransferUseCase {
  constructor(
    @inject('UsersRepository')
    private usersRepository: IUsersRepository,

    @inject('StatementsRepository')
    private statementsRepository: IStatementsRepository,

    @inject('TransfersRepository')
    private transferRepository: ITransfersRepository
  ){}

  async execute({ id, amount, description, sender_id}: ICreateTransferDTO): Promise<Transfer>{
    const userRecipient = await this.usersRepository.findById(id);
    const userSender = await this.statementsRepository.getUserBalance({user_id: id});

    enum OperationType {
      DEPOSIT = 'deposit',
      WITHDRAW = 'withdraw',
    }


    if(!userRecipient) {
      throw new CreateTransferError.UserNotFound();
    }

    if(userSender.balance < amount) {
      throw new CreateTransferError.InsufficientFunds();
    }

    const transfer = await this.transferRepository.create({
      id,
      sender_id,
      amount,
      description
    });

     await this.statementsRepository.create({
      user_id: id,
      amount,
      description,
      type: OperationType.WITHDRAW,
      transfer_id: transfer.transfer_id,
    });

    await this.statementsRepository.create({
      user_id: id,
      amount,
      description,
      type: OperationType.DEPOSIT,
      transfer_id: transfer.transfer_id,
    });

    return transfer;
  }
}

export { CreateTransferUseCase }
