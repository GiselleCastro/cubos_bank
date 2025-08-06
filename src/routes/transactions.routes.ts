import { Router } from 'express';
import type { Request, Response } from 'express';
import { TransactionsControllerFactory } from '../controllers/factories/transactions.controller.factory';

export const router = Router();

const controller = TransactionsControllerFactory.make();

router.post('/', (req: Request, res: Response) => controller.registerUser(req, res));
router.get('/', (req: Request, res: Response) => controller.registerUser(req, res));
router.post('/internal', (req: Request, res: Response) => controller.registerUser(req, res));
router.post('/:transactionId/revert', (req: Request, res: Response) => controller.registerUser(req, res));
