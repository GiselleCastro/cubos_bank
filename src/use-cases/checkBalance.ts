import type { AccountsRepository } from '../repositories/accounts'
import { AppError, BadRequestError, InternalServerError } from '../err/appError'

export class CheckBalanceUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(accountId: string): Promise<{ balance: number }> {
    try {
      const registeredAccount = await this.accountsRepository.findByAccountId(accountId)

      if (!registeredAccount) {
        throw new BadRequestError('Non-existent account.')
      }

      const balance = {
        balance: this.convertCentsToReais(registeredAccount.balance),
      }

      return balance
    } catch (error) {
      if (error instanceof AppError) throw error
      throw new InternalServerError(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (error as any)?.message || 'Error checking balance.',
      )
    }
  }

  private convertCentsToReais(valueInCents: number) {
    const reaisInCents = 100
    return valueInCents / reaisInCents
  }
}
