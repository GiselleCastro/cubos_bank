import type { TransactionsRepository } from '../repositories/transactions'
import { AppError, ConflictError, InternalServerError } from '../err/appError'
import type {
  CreateInternalTransferData,
  CreateInternalTransferReturn,
} from '../types/cards'
import { v4 as uuid } from 'uuid'
import { InternalTransferType } from '@prisma/client'

export class ReverseTransactionUseCase {
  constructor(private readonly transactionsRepository: TransactionsRepository) {}
  async execute(accountId: string, transactionId: string) {
    try {
      const registeredAccount = await this.accountsRepository.findByAccountId(accountId)

      if (!registeredAccount) {
        throw new BadRequestError('Non-existent account.')
      }

      const balance = {
        balance: this.convertCentsToReais(registeredAccount.balance),
      }

      return balance
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new InternalServerError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.message || 'Error checking balance.',
      )
    }
  }
}
