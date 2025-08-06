import type { Request, Response } from 'express';
import type { TransactionsService } from '../use-cases/transactions.service';

export class TransactionsController {
  constructor(private readonly transactionsService: TransactionsService) {}

  async registerUser(req: Request, res: Response) {
    try {
      const result = await this.transactionsService.createUser(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.transactionsService.login(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({ error: 'Login inválido' });
    }
  }
}
