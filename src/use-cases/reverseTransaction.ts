import type { TransactionsRepository } from '../repositories/transactions'
import {
  AppError,
  BadRequestError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
  PaymentRequiredError,
} from '../err/appError'
import { v4 as uuid } from 'uuid'
import { TransactionType } from '@prisma/client'
import type { AccountsRepository } from '../repositories/accounts'
import {
  convertAbsoluteAmountToAmount,
  convertCentsToReais,
} from '../utils/moneyConverter'

export class ReverseTransactionUseCase {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {}
  async execute(accountId: string, transactionId: string, userId: string) {
    try {
      const registeredAccount = await this.accountsRepository.findByAccountId(accountId)

      if (!registeredAccount || registeredAccount.userId !== userId) {
        throw new ForbiddenError(
          'Access denied. This account does not belong to the authenticated user.',
        )
      }

      const registeredTransaction =
        await this.transactionsRepository.findByAccountIdAndtransactionId(
          accountId,
          transactionId,
        )

      if (!registeredTransaction) {
        throw new BadRequestError('Non-existent transaction.')
      }

      if (registeredTransaction.isReverted) {
        throw new ConflictError('Transaction already reverted.')
      }

      const revertedTransactionType =
        registeredTransaction.type === TransactionType.credit
          ? TransactionType.debit
          : TransactionType.credit

      let balanceCurrent: number

      if (revertedTransactionType === TransactionType.debit) {
        balanceCurrent = registeredAccount.balance - registeredTransaction.value

        if (balanceCurrent < 0) {
          throw new PaymentRequiredError('Insufficient balance.')
        }
      } else {
        balanceCurrent = registeredAccount.balance + registeredTransaction.value
      }

      const registerRevertedTransaction = await this.transactionsRepository.revert(
        {
          id: uuid(),
          value: registeredTransaction.value,
          type: revertedTransactionType,
          description: `Refunded - ${registeredTransaction.description}`,
          accountId,
          reversedById: transactionId,
        },
        balanceCurrent,
      )

      const absoluteAmountRefunded = convertCentsToReais(registeredTransaction.value)

      const registeredRevertedTransaction = {
        id: registerRevertedTransaction.id,
        value: convertAbsoluteAmountToAmount(
          absoluteAmountRefunded,
          revertedTransactionType,
        ),
        description: registerRevertedTransaction.description,
        createdAt: registerRevertedTransaction.createdAt,
        updatedAt: registerRevertedTransaction.updatedAt,
      }
      return registeredRevertedTransaction
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new InternalServerError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.message || 'Error reversing transaction.',
      )
    }
  }
}
