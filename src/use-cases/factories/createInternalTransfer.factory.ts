import { CreateInternalTransferUseCase } from '../createInternalTransfer'
import { TransactionsRepositoryFactory } from '../../repositories/factories/transactions.factory'

export class CreateInternalTransferUseCaseFactory {
  static make(): CreateInternalTransferUseCase {
    const repository = TransactionsRepositoryFactory.make()
    return new CreateInternalTransferUseCase(repository)
  }
}
