import { Router } from 'express';
import { CardsControllerFactory } from '../controllers/factories/cards.controller.factory';
import { AuthMiddleware } from '../middlewares/authentication';
import { ValidateSchemaMiddleware } from '../middlewares/schemaValidation';
import { listOfCardsBodySchema } from '../schema/card';
import { Params } from '../middlewares/schemaValidation';

export const router = Router();

const controller = CardsControllerFactory.make();

router.use(AuthMiddleware.handle())
router.get('/',ValidateSchemaMiddleware.handle(listOfCardsBodySchema, Params.QUERY), controller.listOfCards());