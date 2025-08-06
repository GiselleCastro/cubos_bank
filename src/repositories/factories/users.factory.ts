import { UsersRepository } from "../users";
import { prisma } from '../../prisma/client.js';

export class UsersRepositoryFactory {
  static make(): UsersRepository {
    return new UsersRepository(prisma);
  }
}