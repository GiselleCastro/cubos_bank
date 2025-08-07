import type { AccountsRepository } from '../repositories/accounts'
import { AppError, InternalServerError } from '../err/appError'

export class ListOfCardsByAccountUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(accountId: string) {
    try {
      const registeredAccount =
        await this.accountsRepository.listOfCardsByAccountId(accountId)

      return registeredAccount
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new InternalServerError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.message || `Error listing cards for accountId ${accountId}.`,
      )
    }
  }
}
