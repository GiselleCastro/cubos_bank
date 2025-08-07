import { Router } from 'express'
import { AuthMiddleware } from '../middlewares/authentication'
import { ValidateSchemaMiddleware } from '../middlewares/schemaValidation'
import { TransactionsControllerFactory } from '../controllers/factories/transactions.controller.factory'

export const router = Router()

const controller = TransactionsControllerFactory.make()

router.use(AuthMiddleware.handle())
router.post('/', ValidateSchemaMiddleware.handle(), controller.registerUser())
router.get('/', controller.registerUser())
router.post('/internal', ValidateSchemaMiddleware.handle(), controller.registerUser())
router.post(
  '/:transactionId/revert',
  ValidateSchemaMiddleware.handle(),
  controller.registerUser(),
)
