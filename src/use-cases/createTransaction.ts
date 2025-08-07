import type { TransactionsRepository } from '../repositories/transactions'
import {
  AppError,
  BadRequestError,
  InternalServerError,
  PaymentRequiredError,
} from '../err/appError'
import { v4 as uuid } from 'uuid'
import type {
  CreateTransactionData,
  CreateTransactionReturn,
} from '../types/transactions'
import { TransactionType } from '@prisma/client'
import { AccountsRepository } from '../repositories/accounts'
import { convertReaisToCents } from '../utils/moneyConverter'

export class CreateTransactionUseCase {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async execute(
    data: CreateTransactionData,
    userId: string,
    accountId: string,
  ): Promise<CreateTransactionReturn> {
    try {
      const registeredAccount = await this.accountsRepository.findByAccountId(accountId)

      if (!registeredAccount) {
        throw new BadRequestError('Non-existent account.')
      }

      const transactionType =
        data.value > 0 ? TransactionType.credit : TransactionType.debit

      const absoluteValueInCentsOfTheTransaction = Math.abs(
        convertReaisToCents(data.value),
      )

      let balanceCurrent: number

      if (transactionType === TransactionType.debit) {
        balanceCurrent = registeredAccount.balance - absoluteValueInCentsOfTheTransaction

        if (balanceCurrent < 0) {
          throw new PaymentRequiredError('Insufficient balance.')
        }
      } else {
        balanceCurrent = registeredAccount.balance + absoluteValueInCentsOfTheTransaction
      }

      const registeredTransaction = await this.transactionsRepository.create(
        {
          id: uuid(),
          value: absoluteValueInCentsOfTheTransaction,
          type: transactionType,
          description: data.description,
          accountId,
        },
        balanceCurrent,
      )

      const transactionCreated = {
        id: registeredTransaction.id,
        value: data.value,
        description: registeredTransaction.description,
        createdAt: registeredTransaction.createdAt,
        updatedAt: registeredTransaction.updatedAt,
      }

      return transactionCreated
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new InternalServerError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.message || 'Error checking balance.',
      )
    }
  }
}
