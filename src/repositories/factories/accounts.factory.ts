import { AccountsRepository } from "../accounts";
import { prisma } from '../../prisma/client.js';

export class AccountsRepositoryFactory {
  static make(): AccountsRepository {
    return new AccountsRepository(prisma);
  }
}