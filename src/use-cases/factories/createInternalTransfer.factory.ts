import { CreateInternalTransferUseCase } from '../createInternalTransfer'
import { AccountsRepositoryFactory } from '../../repositories/factories/accounts.factory'
import { TransactionsRepositoryFactory } from '../../repositories/factories/transactions.factory'

export class CreateInternalTransferUseCaseFactory {
  static make(): CreateInternalTransferUseCase {
    const transactions = TransactionsRepositoryFactory.make()
    const accounts = AccountsRepositoryFactory.make()
    return new CreateInternalTransferUseCase(accounts, transactions)
  }
}
