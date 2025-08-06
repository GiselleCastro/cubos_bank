import { TransactionsController } from '../transactions.controller'
import { TransactionsUseCaseFactory } from '../../use-cases/factories/transactions.factory'

export class TransactionsControllerFactory {
  static make(): TransactionsController {
    const service = TransactionsUseCaseFactory.make()
    return new TransactionsController(service)
  }
}
