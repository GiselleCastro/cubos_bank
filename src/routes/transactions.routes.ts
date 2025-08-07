import { Router } from 'express'
import { AuthMiddleware } from '../middlewares/authentication'
import { Params, ValidateSchemaMiddleware } from '../middlewares/schemaValidation'
import { TransactionsControllerFactory } from '../controllers/factories/transactions.controller.factory'
import {
  createTransactionBodySchema,
  createInternalTransferBodySchema,
  idTransactionParamsSchema,
  transactionPaginationSchema,
} from '../schema/transactions'
import { idAccountParamsSchema } from '../schema/accounts'
export const router = Router()

const controller = TransactionsControllerFactory.make()

router.use(AuthMiddleware.handle())
router.post(
  '/',
  ValidateSchemaMiddleware.handle(createTransactionBodySchema),
  controller.createTransaction(),
)
router.get(
  '/',
  ValidateSchemaMiddleware.handle(transactionPaginationSchema, Params.QUERY),
  controller.listOfAllTransactions(),
)
router.post(
  '/internal',
  ValidateSchemaMiddleware.handle(createInternalTransferBodySchema),
  controller.createInternalTransfer(),
)
router.post(
  '/:transactionId/revert',
  ValidateSchemaMiddleware.handle(idAccountParamsSchema, Params.PARAMS),
  ValidateSchemaMiddleware.handle(idTransactionParamsSchema, Params.PARAMS),
  controller.reverseTransaction(),
)
