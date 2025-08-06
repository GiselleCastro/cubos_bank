import { AccountsController } from "../accounts.controller";
import { CreateAccountUseCaseFactory } from "../../use-cases/factories/createAccount.factory";
import { ListOfAccountsUseCaseFactory } from "../../use-cases/factories/listOfAccount.factory";

export class AccountsControllerFactory {
  static make(): AccountsController {
    const createAccount = CreateAccountUseCaseFactory.make();
    const listOfAccountsUseCaseFactory = ListOfAccountsUseCaseFactory.make();
    return new AccountsController(createAccount, listOfAccountsUseCaseFactory);
  }
}