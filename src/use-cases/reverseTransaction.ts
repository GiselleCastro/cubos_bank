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
import {
  Accounts,
  Transactions,
  TransactionStatus,
  TransactionType,
} from '@prisma/client'
import type { AccountsRepository } from '../repositories/accounts'
import {
  convertAbsoluteAmountToAmount,
  convertCentsToReais,
} from '../utils/moneyConverter'
import { invertTransactionType } from '../utils/transactionType'
import { CompilanceAPI } from '../infrastructure/compilanceAPI'
import { pollingTransactionStatus } from '../utils/pollingTransactionStatus'

export class ReverseTransactionUseCase {
  constructor(
    private readonly accountsRepository: AccountsRepository,
    private readonly transactionsRepository: TransactionsRepository,
    private readonly compilanceAPI: CompilanceAPI,
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
        )
      }

      const absoluteAmountRefunded = convertCentsToReais(value)
      /// ver value
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
  ) {
    const { status, empontentId } = registeredTransaction

    if (!empontentId)
      throw new BadRequestError('There is no registered empontentId for the transaction.')

    if (status !== TransactionStatus.authorized) {
      const { data } = await this.compilanceAPI.getTransactionById(empontentId)

      const statusUpdated = data.status

      if (statusUpdated !== TransactionStatus.authorized)
        throw new ConflictError(
          'Transaction is not authorized or has not been completed and cannot be reverted.',
        )
    }

    const revertedTransactionType = invertTransactionType(registeredTransaction.type)

    const value =
      revertedTransactionType === TransactionType.debit
        ? -registeredTransaction.value
        : registeredTransaction.value

    const balanceCurrent = registeredAccount.balance + value

    if (balanceCurrent < 0) {
      throw new PaymentRequiredError('Insufficient balance.')
    }

    const newTransactionId = uuid()

    await this.compilanceAPI.createTransaction(empontentId, {
      description: registeredTransaction.description,
      externalId: newTransactionId,
    })

    const statusTransaction = await pollingTransactionStatus(empontentId, () =>
      this.compilanceAPI.getTransactionById(empontentId),
    )

    const registerRevertedTransaction = await this.transactionsRepository.revert(
      {
        id: newTransactionId,
        value: registeredTransaction.value,
        type: revertedTransactionType,
        description: registeredTransaction.description,
              accountId,
        reversedById: registeredTransaction.id,
        status: statusTransaction,
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
    const listOfTransactionsToReverse =
      await this.transactionsRepository.findByRelatedTransactionId(relatedTransactionId)

    if (listOfTransactionsToReverse.length !== 2) {
      throw new BadRequestError(
        'Internal transactions related to this transaction not found.',
      )
    }
    const transactionAccountOwner = listOfTransactionsToReverse.find(
      (i) => i.accountId === ownerAccountId,
    )
    const transactionAccountReceiver = listOfTransactionsToReverse.find(
      (i) => i.accountId !== ownerAccountId,
    )

    if (!transactionAccountOwner || !transactionAccountReceiver) {
      throw new BadRequestError("The owner's account is not related to this transaction.")
    }

    const registeredAccountReceiver = (await this.accountsRepository.findByAccountId(
      transactionAccountReceiver.accountId,
    )) as Accounts

    const isDebit = transactionAccountOwner.type === TransactionType.debit
    const value = transactionAccountOwner.value

    const balanceCurrentOwner = isDebit
      ? registeredAccountOwner.balance - value
      : registeredAccountOwner.balance + value

    const balanceCurrentReceiver = isDebit
      ? registeredAccountReceiver.balance + value
      : registeredAccountReceiver.balance - value

    if (balanceCurrentOwner < 0) {
      throw new PaymentRequiredError("Insufficient balance in the owner's account.")
    }

    if (balanceCurrentReceiver < 0) {
      throw new PaymentRequiredError("Insufficient balance in the receiver's account.")
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
      status: TransactionStatus.authorized,
    }

    const transactionReceiverAccount = {
      id: uuid(),
      value: transactionAccountReceiver.value,
      type: invertTransactionType(transactionAccountReceiver.type),
      description: transactionAccountReceiver.description,
      accountId: transactionAccountReceiver.accountId,
      reversedById: transactionAccountReceiver.id,
      relatedTransactionId: newRelatedTransactionId,
      status: TransactionStatus.authorized,
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
