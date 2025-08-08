import type { AccountsRepository } from '../repositories/accounts'
import { AppError, ForbiddenError, InternalServerError } from '../err/appError'

export class ListOfCardsByAccountUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(accountId: string, userId: string) {
    try {
      const registeredAccount = await this.accountsRepository.findByAccountId(accountId)
      if (registeredAccount?.userId !== userId) {
        throw new ForbiddenError(
          'Access denied. This account does not belong to the authenticated user.',
        )
      }
      const cardsByAccount =
        await this.accountsRepository.listOfCardsByAccountId(accountId)

      return cardsByAccount
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new InternalServerError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.message || `Error listing cards for accountId ${accountId}.`,
      )
    }
  }
}
