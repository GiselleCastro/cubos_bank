import type { Request, Response } from 'express';
import type { CreateAccountUseCase } from '../use-cases/createAccount';
import type { ListOfAccountsUseCase } from '../use-cases/ListOfAccounts';
import { HttpStatusCode } from 'axios';

export class AccountsController {
  constructor(private readonly createAccountUseCase: CreateAccountUseCase, private readonly listOfAccountsUseCase: ListOfAccountsUseCase) {}

 createAccount(){
  return async (req: Request, res: Response) =>{
    try {
      const userId = req.headers.authorization as string;
      const result = await this.createAccountUseCase.execute(req.body, userId);
      return res.status(HttpStatusCode.Created).json(result);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}

listOfAccounts(){
  return async (req: Request, res: Response) =>{
    try {
      const userId = req.headers.authorization as string;
      const result = await this.listOfAccountsUseCase.execute(userId);
      return res.status(HttpStatusCode.Ok).json(result);
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
}
}
