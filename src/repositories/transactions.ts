import type { PrismaClient } from '@prisma/client'

export class TransactionsRepository {
  constructor(private readonly prisma: PrismaClient) {}
}
