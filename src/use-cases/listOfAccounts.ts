import { InternalServerError } from '../err/appError'
import type { AccountsRepository } from '../repositories/accounts'
import { AccountType } from '../types/accounts'

export class ListOfAccountsUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(userId: string): Promise<AccountType[]> {
    try {
      const accountsRegistered = await this.accountsRepository.findByUserId(userId)
      return accountsRegistered
    } catch (error: any) {
      throw new InternalServerError(error?.message || 'Error listing accounts.')
    }
  }
}
