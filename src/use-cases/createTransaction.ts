import type { TransactionsRepository } from '../repositories/transactions'
import {
  AppError,
  ForbiddenError,
  InternalServerError,
  PaymentRequiredError,
} from '../err/appError'
import { v4 as uuid } from 'uuid'
import type {
  CreateTransactionData,
  CreateTransactionReturn,
  TransactionInProcessing,
} from '../types/transactions'
import { TransactionStatus, TransactionType } from '@prisma/client'
import { AccountsRepository } from '../repositories/accounts'
import { convertReaisToCents } from '../utils/moneyConverter'
import { inferTransactionType } from '../utils/transactionType'
import { CompilanceAPI } from '../infrastructure/compilanceAPI'
import { pollingTransactionStatus } from '../utils/pollingTransactionStatus'
import { HttpStatusCode } from 'axios'

export class CreateTransactionUseCase {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly compilanceAPI: CompilanceAPI,
  ) {}

  async execute(
    data: CreateTransactionData,
    userId: string,
    accountId: string,
  ): Promise<CreateTransactionReturn | TransactionInProcessing> {
    try {
      const registeredAccount = await this.accountsRepository.findByAccountId(accountId)

      if (!registeredAccount || registeredAccount.userId !== userId) {
        throw new ForbiddenError(
          'Access denied. This account does not belong to the authenticated user.',
        )
      }

      const transactionType = inferTransactionType(data.value)

      const absoluteAmountInCentsOfTheTransaction = Math.abs(
        convertReaisToCents(data.value),
      )

      let balanceCurrent: number

      if (transactionType === TransactionType.debit) {
        balanceCurrent = registeredAccount.balance - absoluteAmountInCentsOfTheTransaction

        if (balanceCurrent < 0) {
          throw new PaymentRequiredError('Insufficient balance.')
        }
      } else {
        balanceCurrent = registeredAccount.balance + absoluteAmountInCentsOfTheTransaction
      }

      const empontentId = uuid()

      const transactionId = uuid()

      await this.compilanceAPI.createTransaction(empontentId, {
        description: data.description,
        externalId: transactionId,
      })

      const status = await pollingTransactionStatus(empontentId, () =>
        this.compilanceAPI.getTransactionById(empontentId),
      )

      const registeredTransaction = await this.transactionsRepository.create(
        {
          id: transactionId,
          value: absoluteAmountInCentsOfTheTransaction,
          type: transactionType,
          description: data.description,
          accountId,
          empontentId,
          status,
        },
        balanceCurrent,
      )

      if (status === TransactionStatus.processing) {
        return {
          statusCode: HttpStatusCode.Accepted,
          message: 'The transaction is processing.',
        }
      }

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
