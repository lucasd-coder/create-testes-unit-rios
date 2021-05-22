import { Request, Response } from "express";
import { container } from "tsyringe";
import { CreateTransferUseCase } from "./CreateTransferUseCase";

class CreateTransferController {

  async execute(request: Request, response: Response): Promise<Response> {
    const { id } = request.user;
    const { amount, description } = request.body;
    const { user_id: sender_id } = request.params

    const createTransferUseCase = container.resolve(CreateTransferUseCase);

    const transfer = await createTransferUseCase.execute({ id, amount, description, sender_id});

    return response.status(201).json(transfer);
  }
}

export { CreateTransferController }
