import type { CardsRepository } from '../repositories/cards'
import { AppError, InternalServerError } from '../err/appError'
import type { CardsReturnPagination, PaginationByUser } from '../types/cards'

export class ListOfCardsUseCase {
  constructor(private readonly cardsRepository: CardsRepository) {}

  async execute({
    userId,
    itemsPerPage = 10,
    currentPage = 1,
  }: PaginationByUser): Promise<CardsReturnPagination> {
    try {
      const skip = (currentPage - 1) * itemsPerPage
      const take = itemsPerPage

      const listOfCards = await this.cardsRepository.findByUserId(userId, skip, take)

      const listOfCardsWithLastFourDigitsOfTheCardNumber = listOfCards.map((i) => ({
        ...i,
        number: i.number.slice(-4),
      }))

      const pagination = {
        itemsPerPage,
        currentPage,
      }

      return { cards: listOfCardsWithLastFourDigitsOfTheCardNumber, pagination }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new InternalServerError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.message || 'Error listing all cards.',
      )
    }
  }
}
