import type { PrismaClient, Transactions, TransactionType } from '@prisma/client'
import type { CreateTransaction, RevertTransaction } from '../types/transactions'

export class TransactionsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateTransaction, balance: number): Promise<Transactions> {
    const [transaction] = await this.prisma.$transaction([
      this.prisma.transactions.create({ data }),
      this.prisma.accounts.update({
        where: { id: data.accountId },
        data: {
          balance,
        },
      }),
    ])

    return transaction
  }

  async revert(data: RevertTransaction, balance: number): Promise<Transactions> {
    const [transaction] = await this.prisma.$transaction([
      this.prisma.transactions.create({ data }),
      this.prisma.transactions.update({
        where: { id: data.reversedById },
        data: {
          isReverted: true,
        },
      }),
      this.prisma.accounts.update({
        where: { id: data.accountId },
        data: {
          balance,
        },
      }),
    ])

    return transaction
  }

  async revertInternal(
    transactionOwnerAccount: RevertTransaction,
    transactionReceiverAccount: RevertTransaction,
    balanceOwner: number,
    balanceReceiver: number,
    relatedTransactionId: string,
  ): Promise<Transactions> {
    const [transactionInternalOwnerAccount] = await this.prisma.$transaction([
      this.prisma.transactions.create({ data: transactionOwnerAccount }),
      this.prisma.transactions.create({ data: transactionReceiverAccount }),
      this.prisma.accounts.update({
        where: { id: transactionOwnerAccount.accountId },
        data: {
          balance: balanceOwner,
        },
      }),
      this.prisma.accounts.update({
        where: { id: transactionReceiverAccount.accountId },
        data: {
          balance: balanceReceiver,
        },
      }),
      this.prisma.transactions.updateMany({
        where: { relatedTransactionId },
        data: {
          isReverted: true,
        },
      }),
    ])

    return transactionInternalOwnerAccount
  }

  async createInternal(
    transactionOwnerAccount: CreateTransaction,
    transactionReceiverAccount: CreateTransaction,
    balanceOwner: number,
    balanceReceiver: number,
  ): Promise<Transactions> {
    const [transactionInternalOwnerAccount] = await this.prisma.$transaction([
      this.prisma.transactions.create({ data: transactionOwnerAccount }),
      this.prisma.transactions.create({ data: transactionReceiverAccount }),
      this.prisma.accounts.update({
        where: { id: transactionOwnerAccount.accountId },
        data: {
          balance: balanceOwner,
        },
      }),
      this.prisma.accounts.update({
        where: { id: transactionReceiverAccount.accountId },
        data: {
          balance: balanceReceiver,
        },
      }),
    ])

    return transactionInternalOwnerAccount
  }

  async findByAccountId(
    accountId: string,
    skip: number,
    take: number,
    type: TransactionType | null = null,
  ) {
    return this.prisma.transactions.findMany({
      where: {
        accountId,
        ...(type && { type }),
      },
      skip,
      take,
    })
  }

  async findByRelatedTransactionId(relatedTransactionId: string) {
    return this.prisma.transactions.findMany({
      where: {
        relatedTransactionId,
      },
    })
  }

  async findByAccountIdAndtransactionId(accountId: string, transactionId: string) {
    return this.prisma.transactions.findUnique({
      where: {
        id: transactionId,
        accountId,
      },
    })
  }
}
