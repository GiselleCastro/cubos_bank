import type { Request, Response } from 'express';
import { AccountsService } from '../use-cases/accounts.service';

export class AccountsController {
  constructor(private readonly accountsService: AccountsService) {}

  async registerUser(req: Request, res: Response) {
    try {
      const result = await this.accountsService.createUser(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.accountsService.login(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({ error: 'Login inválido' });
    }
  }
}
