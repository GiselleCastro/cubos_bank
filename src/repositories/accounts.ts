import { PrismaClient } from '@prisma/client'
import type { Accounts } from '@prisma/client'
import type { CreateCardReturn } from '../types/cards'

type CreateAccount = {
  id: string
  branch: string
  account: string
  userId: string
}

export class AccountsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateAccount): Promise<Accounts> {
    return this.prisma.accounts.create({ data })
  }

  async findByUserId(userId: string): Promise<Accounts[]> {
    return this.prisma.accounts.findMany({ where: { userId } })
  }

  async findByAccountId(accountId: string): Promise<Accounts | null> {
    return this.prisma.accounts.findUnique({ where: { id: accountId } })
  }

  async listOfCardsByAccountId(accountId: string): Promise<CreateCardReturn[] | null> {
    return this.prisma.cards.findMany({
      select: {
        id: true,
        type: true,
        number: true,
        cvv: true,
        createdAt: true,
        updatedAt: true,
      },
      where: { accountId },
    })
  }

  async findByAccountNumberAndBranch(
    account: string,
    branch: string,
  ): Promise<Accounts | null> {
    return this.prisma.accounts.findFirst({ where: { account, branch } })
  }
}
