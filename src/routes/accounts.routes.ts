import { Router } from 'express';
import { AccountsControllerFactory } from '../controllers/factories/accounts.controller.factory';
import { ValidateSchemaMiddleware } from '../middlewares/schemaValidation';
import { createAccountBodySchema } from '../schema/account';
import { AuthMiddleware } from '../middlewares/authentication';

export const router = Router();

const controller = AccountsControllerFactory.make();

router.use(AuthMiddleware.handle())
router.post('/', ValidateSchemaMiddleware.handle(createAccountBodySchema), controller.createAccount());
router.get('/', controller.listOfAccounts());
//router.post('/:accountId/cards', ValidateSchemaMiddleware.handle(createAccountBodySchema), controller.createCard());
//router.get('/:accountId/balance', ValidateSchemaMiddleware.handle(createAccountBodySchema), controller.checkBalance());