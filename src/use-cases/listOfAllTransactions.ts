import type { TransactionsRepository } from '../repositories/transactions'
import { AppError, InternalServerError } from '../err/appError'
import type {
  PaginationByTransaction,
  TransactionsReturnPagination,
} from '../types/transactions'
import { convertCentsToReais } from '../utils/moneyConverter'
import { TransactionType } from '@prisma/client'
export class ListOfAllTransactionsUseCase {
  constructor(private readonly transactionsRepository: TransactionsRepository) {}

  async execute({
    accountId,
    itemsPerPage = 10,
    currentPage = 1,
    type,
  }: PaginationByTransaction): Promise<TransactionsReturnPagination> {
    try {
      const skip = (currentPage - 1) * itemsPerPage
      const take = itemsPerPage

      const listOfAllTransactions = await this.transactionsRepository.findByAccountId(
        accountId,
        skip,
        take,
        type,
      )

      const listOfAllTransactionsDisplay = listOfAllTransactions.map((i) => {
        const absoluteValueInReaisOfTheTransaction = convertCentsToReais(i.value)
        return {
          id: i.id,
          value:
            i.type === TransactionType.credit
              ? absoluteValueInReaisOfTheTransaction
              : -absoluteValueInReaisOfTheTransaction,
          description: i.description,
          createdAt: i.createdAt,
          updatedAt: i.updatedAt,
        }
      })

      const pagination = {
        itemsPerPage,
        currentPage,
      }

      return { transactions: listOfAllTransactionsDisplay, pagination }
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new InternalServerError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.message || 'Error checking balance.',
      )
    }
  }
}
