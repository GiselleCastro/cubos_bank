import { AccountsController } from "../accounts.controller";
import { AccountsService } from '../services/accounts.service';

export class AccountsControllerFactory {
  static make(): AccountsController {
    const service = new AccountsService();
    return new AccountsController(service);
  }
}