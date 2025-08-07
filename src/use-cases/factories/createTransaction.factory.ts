import { CreateTransactionUseCase } from '../createTransaction'
import { TransactionsRepositoryFactory } from '../../repositories/factories/transactions.factory'

export class CreateTransactionUseCaseFactory {
  static make(): CreateTransactionUseCase {
    const repository = TransactionsRepositoryFactory.make()
    return new CreateTransactionUseCase(repository)
  }
}
