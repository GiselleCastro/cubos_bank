import { LoginUseCase } from "../login";
import { UsersRepositoryFactory } from "../../repositories/factories/users.factory";

export class LoginCaseFactory {
  static make(): LoginUseCase {
    const repository = UsersRepositoryFactory.make()
    return new LoginUseCase(repository);
  }
}