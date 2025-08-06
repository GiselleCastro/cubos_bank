import { PrismaClient } from '@prisma/client';
import type { Cards, CardType } from '@prisma/client';

type CreateCard = {
    id: string,
    type: CardType,
    number: string,
    cvv: string
}

export class CardsRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(data: CreateCard): Promise<Cards> {
    return this.prisma.cards.create({ data });
  }

  async findByaccountId(accountId: string): Promise<Cards| null> {
    return this.prisma.cards.findUnique({ where: { id: accountId } });
  }
}
