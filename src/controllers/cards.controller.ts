import type { Request, Response } from 'express';
import { CardsService } from '../use-cases/cards.service';

export class CardsController {
  constructor(private readonly cardsService: CardsService) {}

  async registerUser(req: Request, res: Response) {
    try {
      const result = await this.cardsService.createUser(req.body);
      return res.status(201).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }

  async login(req: Request, res: Response) {
    try {
      const result = await this.cardsService.login(req.body);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(401).json({ error: 'Login inválido' });
    }
  }
}
