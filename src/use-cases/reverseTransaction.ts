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
import { Accounts, Transactions, TransactionType } from '@prisma/client'
import type { AccountsRepository } from '../repositories/accounts'
import {
  convertAbsoluteAmountToAmount,
  convertCentsToReais,
} from '../utils/moneyConverter'
import { invertTransactionType } from '../utils/transactionType'

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

      let registerRevertedTransaction

      const { relatedTransactionId, value } = registeredTransaction
      if (relatedTransactionId) {
        registerRevertedTransaction = await this.reverseInternal(
          relatedTransactionId,
          accountId,
          registeredAccount,
        )
      } else {
        registerRevertedTransaction = await this.reverse(
          registeredAccount,
          registeredTransaction,
          accountId,
          transactionId,
        )
      }

      const absoluteAmountRefunded = convertCentsToReais(value)

      const registeredRevertedTransaction = {
        id: registerRevertedTransaction.id,
        value: convertAbsoluteAmountToAmount(
          absoluteAmountRefunded,
          registerRevertedTransaction.type,
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

  private async reverse(
    registeredAccount: Accounts,
    registeredTransaction: Transactions,
    accountId: string,
    transactionId: string,
  ) {
    const revertedTransactionType = invertTransactionType(registeredTransaction.type)

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
    return registerRevertedTransaction
  }

  private async reverseInternal(
    relatedTransactionId: string,
    ownerAccountId: string,
    registeredAccountOwner: Accounts,
  ) {
    let balanceCurrentOwner: number
    let balanceCurrentReceiver: number

    const listOfTransactionsToReverse =
      await this.transactionsRepository.findByRelatedTransactionId(relatedTransactionId)

    const transactionAccountOwner = listOfTransactionsToReverse.find(
      (i) => i.accountId === ownerAccountId,
    )
    const transactionAccountReceiver = listOfTransactionsToReverse.find(
      (i) => i.accountId !== ownerAccountId,
    )

    if (!transactionAccountOwner || !transactionAccountReceiver) {
      throw new BadRequestError('oo')
    }
    const registeredAccountReceiver = (await this.accountsRepository.findByAccountId(
      transactionAccountReceiver.accountId,
    )) as Accounts

    if (transactionAccountOwner.type === TransactionType.debit) {
      balanceCurrentOwner = registeredAccountOwner.balance - transactionAccountOwner.value
      if (balanceCurrentOwner < 0) {
        throw new PaymentRequiredError("Insufficient balance in the owner's account.")
      }
      balanceCurrentReceiver =
        registeredAccountReceiver.balance + transactionAccountOwner.value
    } else {
      balanceCurrentReceiver =
        registeredAccountReceiver.balance - transactionAccountOwner.value
      if (balanceCurrentReceiver < 0) {
        throw new PaymentRequiredError("Insufficient balance in the receiver's account.")
      }
      balanceCurrentOwner = registeredAccountOwner.balance + transactionAccountOwner.value
    }

    const newRelatedTransactionId = uuid()

    const transactionOwnerAccount = {
      id: uuid(),
      value: transactionAccountOwner.value,
      type: invertTransactionType(transactionAccountOwner.type),
      description: transactionAccountOwner.description,
      accountId: transactionAccountOwner.accountId,
      reversedById: transactionAccountOwner.id,
      relatedTransactionId: newRelatedTransactionId,
    }

    const transactionReceiverAccount = {
      id: uuid(),
      value: transactionAccountReceiver.value,
      type: invertTransactionType(transactionAccountReceiver.type),
      description: transactionAccountReceiver.description,
      accountId: transactionAccountReceiver.accountId,
      reversedById: transactionAccountReceiver.id,
      relatedTransactionId: newRelatedTransactionId,
    }
    const registeredTransaction = await this.transactionsRepository.revertInternal(
      transactionOwnerAccount,
      transactionReceiverAccount,
      balanceCurrentOwner,
      balanceCurrentReceiver,
      relatedTransactionId,
    )

    return registeredTransaction
  }
}
