import { Router } from 'express';
import { CardsControllerFactory } from '../controllers/factories/cards.controller.factory';
import { AuthMiddleware } from '../middlewares/authentication';

export const router = Router();

const controller = CardsControllerFactory.make();

router.use(AuthMiddleware.handle())
router.get('/', controller.listOfCards());