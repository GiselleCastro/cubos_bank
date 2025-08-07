import type { CardsRepository } from '../repositories/cards'
import { AppError, InternalServerError } from '../err/appError'
import type { CreateCardReturnPagination, PaginationByUser } from '../types/cards'

export class ListOfCardsUseCase {
  constructor(private readonly cardsRepository: CardsRepository) {}

  async execute({
    userId,
    itemsPerPage = 10,
    currentPage = 1,
  }: PaginationByUser): Promise<CreateCardReturnPagination> {
    try {
      const skip = (currentPage - 1) * itemsPerPage
      const take = itemsPerPage

      const listOfCards = await this.cardsRepository.findByUserId(userId, skip, take)

      const startingPositionOfTheLastFourDigitsOfTheCardNumber = 12

      const listOfCardsWithLastFourDigitsOfTheCardNumber = listOfCards.map((i) => ({
        ...i,
        number: i.number.substring(startingPositionOfTheLastFourDigitsOfTheCardNumber),
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
