import type { AccountsRepository } from '../repositories/accounts'
import { BadRequestError } from '../err/appError'
import { CreateAccountData, CreateAccountReturn } from '../types/accounts'
import { v4 as uuid } from 'uuid'

export class CreateAccountUseCase {
  constructor(private readonly accountsRepository: AccountsRepository) {}

  async execute(data: CreateAccountData, userId: string): Promise<CreateAccountReturn> {
    const accountRegister = await this.accountsRepository.findByAccountNumberAndBranch(
      data.account,
      data.branch,
    )

    if (accountRegister) {
      throw new BadRequestError('Account already registered.')
    }

    const newAccount = await this.accountsRepository.create({
      id: uuid(),
      ...data,
      userId,
    })

    const account = {
      id: newAccount.id,
      branch: newAccount.branch,
      account: newAccount.account,
      createdAt: newAccount.createdAt,
      updatedAt: newAccount.updatedAt,
    }

    return account
  }
}
