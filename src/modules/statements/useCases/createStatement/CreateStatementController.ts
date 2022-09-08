import { Request, Response } from 'express';
import { container } from 'tsyringe';

import { CreateStatementUseCase } from './CreateStatementUseCase';

enum OperationType {
  DEPOSIT = 'deposit',
  WITHDRAW = 'withdraw',
  TRANSFER = 'transfers',
}

export class CreateStatementController {
  async execute(request: Request, response: Response) {
    const { id: user_id } = request.user;
    const { amount, description } = request.body;
    const { user_id: receiver } = request.params;

    const splittedPath = request.originalUrl.split('/');

    const type =
      splittedPath.length > 5
        ? (splittedPath[splittedPath.length - 2] as OperationType)
        : (splittedPath[splittedPath.length - 1] as OperationType);

    const createStatement = container.resolve(CreateStatementUseCase);

    const statement = await createStatement.execute({
      user_id: receiver || user_id,
      type,
      amount,
      description,
      sender_id: receiver ? user_id : receiver,
    });

    return response.status(201).json(statement);
  }
}
