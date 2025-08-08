import type { CardsRepository } from '../repositories/cards'
import {
  AppError,
  ConflictError,
  ForbiddenError,
  InternalServerError,
} from '../err/appError'
import type { CreateCardData, CreateCardReturn } from '../types/cards'
import { v4 as uuid } from 'uuid'
import { CardType } from '@prisma/client'
import type { AccountsRepository } from '../repositories/accounts'

export class CreateCardUseCase {
  constructor(
    private readonly cardsRepository: CardsRepository,
    private readonly accountsRepository: AccountsRepository,
  ) {}

  async execute(
    data: CreateCardData,
    accountId: string,
    userId: string,
  ): Promise<CreateCardReturn> {
    data.number = data.number.replace(/\D/g, '')

    try {
      const registeredAccount = await this.accountsRepository.findByAccountId(accountId)
      if (registeredAccount?.userId !== userId) {
        throw new ForbiddenError(
          'Access denied. This account does not belong to the authenticated user.',
        )
      }

      if (data.type == CardType.physical) {
        const registeredCard = await this.cardsRepository.findByAccountIdAndType(
          accountId,
          data.type,
        )

        if (registeredCard) {
          throw new ConflictError('There is already a physical card for this account')
        }
      }

      const registeredCard = await this.cardsRepository.findByCardNumber(data.number)

      if (registeredCard) {
        throw new ConflictError('This card already exists.')
      }

      const newCard = await this.cardsRepository.create({
        id: uuid(),
        ...data,
        accountId,
      })

      const startingPositionOfTheLastFourDigitsOfTheCard = 12

      const newCardCreated = {
        id: newCard.id,
        type: newCard.type,
        number: newCard.number.substring(startingPositionOfTheLastFourDigitsOfTheCard),
        cvv: newCard.cvv,
        createdAt: newCard.createdAt,
        updatedAt: newCard.updatedAt,
      }

      return newCardCreated
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new InternalServerError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.message || 'Error in the process of creating a card.',
      )
    }
  }
}
