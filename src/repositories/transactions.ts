import type { PrismaClient, Transactions, TransactionType } from '@prisma/client'
import type { CreateTransaction } from '../types/transactions'

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
}
