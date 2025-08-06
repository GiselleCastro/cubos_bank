import { Router } from 'express';
import type { Request, Response } from 'express';
import { AccountsControllerFactory } from '../controllers/factories/accounts.controller.factory';

export const router = Router();

const controller = AccountsControllerFactory.make();


router.post('/', (req: Request, res: Response) => controller.registerUser(req, res));
router.get('/', (req: Request, res: Response) => controller.registerUser(req, res));
router.get('/:accountId/cards', (req: Request, res: Response) => controller.registerUser(req, res));
router.get('/:accountId/balance', (req: Request, res: Response) => controller.registerUser(req, res));