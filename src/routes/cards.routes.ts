import { Router } from 'express';
import type { Request, Response } from 'express';
import { CardsControllerFactory } from '../controllers/factories/cards.controller.factory';

export const router = Router();

const controller = CardsControllerFactory.make();

router.get('/', (req: Request, res: Response) => controller.login(req, res));