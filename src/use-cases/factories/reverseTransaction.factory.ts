import { ReverseTransactionUseCase } from '../reverseTransaction'
import { TransactionsRepositoryFactory } from '../../repositories/factories/transactions.factory'

export class ReverseTransactionUseCaseFactory {
  static make(): ReverseTransactionUseCase {
    const repository = TransactionsRepositoryFactory.make()
    return new ReverseTransactionUseCase(repository)
  }
}
