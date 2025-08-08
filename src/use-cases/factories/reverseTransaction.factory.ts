import { ReverseTransactionUseCase } from '../reverseTransaction'
import { TransactionsRepositoryFactory } from '../../repositories/factories/transactions.factory'
import { AccountsRepositoryFactory } from '../../repositories/factories/accounts.factory'
import { CompilanceAPIFactory } from '../../infrastructure/factories/compilanceAPI.factory'

export class ReverseTransactionUseCaseFactory {
  static make(): ReverseTransactionUseCase {
    const transactions = TransactionsRepositoryFactory.make()
    const accounts = AccountsRepositoryFactory.make()
    const compilanceAPI = CompilanceAPIFactory.make()
    return new ReverseTransactionUseCase(accounts, transactions, compilanceAPI)
  }
}
