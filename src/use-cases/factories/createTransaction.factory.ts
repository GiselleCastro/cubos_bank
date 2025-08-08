import { CreateTransactionUseCase } from '../createTransaction'
import { AccountsRepositoryFactory } from '../../repositories/factories/accounts.factory'
import { TransactionsRepositoryFactory } from '../../repositories/factories/transactions.factory'
import { CompilanceAPIFactory } from '../../infrastructure/factories/compilanceAPI.factory'
import { CheckTransactionsServiceFactory } from '../../service/factories/checkTransactios.factory'

export class CreateTransactionUseCaseFactory {
  static make(): CreateTransactionUseCase {
    const transactions = TransactionsRepositoryFactory.make()
    const accounts = AccountsRepositoryFactory.make()
    const compilanceAPI = CompilanceAPIFactory.make()
    const checkTransaction = CheckTransactionsServiceFactory.make()
    return new CreateTransactionUseCase(
      accounts,
      transactions,
      compilanceAPI,
      checkTransaction,
    )
  }
}
