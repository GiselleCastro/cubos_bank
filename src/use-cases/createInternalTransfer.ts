import type { TransactionsRepository } from '../repositories/transactions'
import {
  AppError,
  BadRequestError,
  InternalServerError,
  PaymentRequiredError,
} from '../err/appError'
import type { CreateInternalTransferData } from '../types/transactions'
import { v4 as uuid } from 'uuid'
import { TransactionType } from '@prisma/client'
import { AccountsRepository } from '../repositories/accounts'
import { convertReaisToCents } from '../utils/moneyConverter'

export class CreateInternalTransferUseCase {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly transactionsRepository: TransactionsRepository,
  ) {}

  async execute(data: CreateInternalTransferData, accountId: string) {
    try {
      const registeredAccountOwner =
        await this.accountsRepository.findByAccountId(accountId)
      if (!registeredAccountOwner) {
        throw new BadRequestError('Non-existent account for owner.')
      }

      const registeredAccountReceiver = await this.accountsRepository.findByAccountId(
        data.receiverAccountId,
      )

      if (!registeredAccountReceiver) {
        throw new BadRequestError('Non-existent account for receiver.')
      }

      const transactionType =
        data.value > 0 ? TransactionType.credit : TransactionType.debit

      const absoluteAmountInCentsOfTheTransaction = Math.abs(
        convertReaisToCents(data.value),
      )

      let balanceCurrentOwner: number
      let balanceCurrentReceiver: number

      if (transactionType === TransactionType.debit) {
        balanceCurrentOwner =
          registeredAccountOwner.balance - absoluteAmountInCentsOfTheTransaction
        if (balanceCurrentOwner < 0) {
          throw new PaymentRequiredError("Insufficient balance in the owner's account.")
        }
        balanceCurrentReceiver =
          registeredAccountReceiver.balance + absoluteAmountInCentsOfTheTransaction
      } else {
        balanceCurrentReceiver =
          registeredAccountReceiver.balance - absoluteAmountInCentsOfTheTransaction
        if (balanceCurrentReceiver < 0) {
          throw new PaymentRequiredError(
            "Insufficient balance in the receiver's account.",
          )
        }
        balanceCurrentOwner =
          registeredAccountOwner.balance + absoluteAmountInCentsOfTheTransaction
      }

      const registeredTransaction = await this.transactionsRepository.createInternal(
        {
          id: uuid(),
          value: absoluteAmountInCentsOfTheTransaction,
          type: transactionType,
          description: data.description,
          accountId,
        },
        data.receiverAccountId,
        balanceCurrentOwner,
        balanceCurrentReceiver,
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
