import { ListOfAllTransactionsUseCase } from '../listOfAllTransactions'
import { TransactionsRepositoryFactory } from '../../repositories/factories/transactions.factory'
import { AccountsRepositoryFactory } from '../../repositories/factories/accounts.factory'
export class ListOfAllTransactionsUseCaseFactory {
  static make(): ListOfAllTransactionsUseCase {
    const transactions = TransactionsRepositoryFactory.make()
    const accounts = AccountsRepositoryFactory.make()
    return new ListOfAllTransactionsUseCase(transactions, accounts)
  }
}
