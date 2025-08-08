import { PrismaClient } from '@prisma/client'
import type { Cards, CardType } from '@prisma/client'
import type { CreateCard } from '../types/cards'

export class CardsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateCard): Promise<Cards> {
    return this.prisma.cards.create({ data })
  }

  async findByCardNumber(cardNumber: string): Promise<Cards | null> {
    return this.prisma.cards.findUnique({ where: { number: cardNumber } })
  }

  async findByAccountIdAndType(accountId: string, type: CardType): Promise<Cards | null> {
    return this.prisma.cards.findFirst({ where: { accountId: accountId, type } })
  }

  async findByAccountIdAndAccountNumber(
    accountId: string,
    accountNumber: string,
  ): Promise<Cards | null> {
    return this.prisma.cards.findUnique({
      where: { id: accountId, number: accountNumber },
    })
  }

  async findByUserId(userId: string, skip: number, take: number) {
    return this.prisma.cards.findMany({
      select: {
        id: true,
        type: true,
        number: true,
        cvv: true,
        createdAt: true,
        updatedAt: true,
      },
      where: {
        account: {
          user: {
            id: userId,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
      skip,
      take,
    })
  }
}
