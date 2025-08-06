import type { CardsRepository } from '../repositories/cards'
import { AppError, InternalServerError } from '../err/appError'
import { CreateCardReturnPagination, PaginationByUser } from '../types/cards'

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
    } catch (error: any) {
      if (error instanceof AppError) throw error
      throw new InternalServerError(
        error?.message || 'Error in the process of creating a person.',
      )
    }
  }
}
