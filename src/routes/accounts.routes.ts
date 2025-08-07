import { Router } from 'express'
import { AuthMiddleware } from '../middlewares/authentication'
import { ValidateSchemaMiddleware } from '../middlewares/schemaValidation'
import { Params } from '../middlewares/schemaValidation'
import { AccountsControllerFactory } from '../controllers/factories/accounts.controller.factory'
import { createAccountBodySchema, idAccountParamsSchema } from '../schema/accounts'
import { createCardBodySchema } from '../schema/accounts'

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
  '/:accountId/cards',
  ValidateSchemaMiddleware.handle(idAccountParamsSchema, Params.PARAMS),
  controller.listOfCardsByAccount(),
)
router.get(
  '/:accountId/balance',
  ValidateSchemaMiddleware.handle(idAccountParamsSchema, Params.PARAMS),
  controller.checkBalance(),
)
