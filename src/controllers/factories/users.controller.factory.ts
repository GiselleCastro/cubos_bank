import { UsersController } from "../users.controller";
import { LoginCaseFactory } from "../../use-cases/factories/login.factory";
import { CreateUserCaseFactory } from "../../use-cases/factories/createUser.factory";

export class UsersControllerFactory {
  static make(): UsersController {
    const loginCase = LoginCaseFactory.make()
    const createUserCase = CreateUserCaseFactory.make()

    return new UsersController(createUserCase, loginCase);
  }
}