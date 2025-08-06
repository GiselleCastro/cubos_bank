import { Router } from 'express'
import { AccountsControllerFactory } from '../controllers/factories/accounts.controller.factory'
import { ValidateSchemaMiddleware } from '../middlewares/schemaValidation'
import { createAccountBodySchema, idAccountParamsSchema } from '../schema/account'
import { AuthMiddleware } from '../middlewares/authentication'
import { Params } from '../middlewares/schemaValidation'
import { createCardBodySchema } from '../schema/account'

export const router = Router()

const controller = AccountsControllerFactory.make()

router.use(AuthMiddleware.handle())
router.post(
  '/',
  ValidateSchemaMiddleware.handle(createAccountBodySchema),
  controller.createAccount(),
)
router.get('/', controller.listOfAccounts())
router.post(
  '/:accountId/cards',
  ValidateSchemaMiddleware.handle(idAccountParamsSchema, Params.PARAMS),
  ValidateSchemaMiddleware.handle(createCardBodySchema),
  controller.createCard(),
)
router.get(
  '/:accountId/balance',
  ValidateSchemaMiddleware.handle(idAccountParamsSchema, Params.PARAMS),
  controller.checkBalance(),
)
