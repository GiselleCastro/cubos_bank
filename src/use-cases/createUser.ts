import type { UsersRepository } from "../repositories/users";
import type { CreateUserPayload, CreateUserReturn} from "../types/user.js";
import { v4 as uuid } from 'uuid';
import { genSalt, hash } from 'bcrypt'
import { CompilanceAPI } from "../infrastructure/compilanceAPI";
export class CreateUserUseCase {
  constructor(
  private readonly usersRepository : UsersRepository,
  private readonly compilanceAPI: CompilanceAPI
) {}

  async execute(data: CreateUserPayload): Promise<CreateUserReturn> {
    const userRegister = await this.usersRepository.findByDocument(data.document);
    const oi = await this.compilanceAPI.validateCPF({document: data.document})

    if (userRegister) {
      throw new Error('messageError.EMAIL_ALREADY_REGISTERED');
    }


    const salt = await genSalt(12);
    const passwordHash = await hash(data.password, salt);

    const newUser = await this.usersRepository.create({id: uuid(), passwordHash: passwordHash, name: data.name, document: data.document});
    const userData = {
        id: newUser.id,
        name: newUser.name,
        document: newUser.document,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt
      }
    return userData
  }

}