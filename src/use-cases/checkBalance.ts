import type { AccountsRepository } from '../repositories/accounts'
import { BadRequestError } from '../err/appError'

export class CheckBalanceUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(accountId: string): Promise<{ balance: number }> {
    const registeredAccount = await this.accountsRepository.findByAccountId(accountId)

    if (!registeredAccount) {
      throw new BadRequestError('Non-existent account.')
    }

    const account = {
      balance: this.convertCentsToReais(registeredAccount.balance),
    }

    return account
  }

  private convertCentsToReais(valueInCents: number) {
    const reaisInCents = 100
    return valueInCents / reaisInCents
  }
}
