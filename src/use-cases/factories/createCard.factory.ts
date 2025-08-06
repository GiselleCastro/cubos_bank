import { CreateAccountUseCase } from "../createAccount";
import { CardsRepositoryFactory } from "../../repositories/factories/cards.factory";

export class CreateAccountUseCaseFactory {
  static make(): CreateAccountUseCase {
    const repository = CardsRepositoryFactory.make()
    return new CreateAccountUseCase(repository);
  }
}