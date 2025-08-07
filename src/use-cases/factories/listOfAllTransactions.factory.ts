import { ListOfAllTransactionsUseCase } from '../listOfAllTransactions'
import { TransactionsRepositoryFactory } from '../../repositories/factories/transactions.factory'

export class ListOfAllTransactionsUseCaseFactory {
  static make(): ListOfAllTransactionsUseCase {
    const repository = TransactionsRepositoryFactory.make()
    return new ListOfAllTransactionsUseCase(repository)
  }
}
