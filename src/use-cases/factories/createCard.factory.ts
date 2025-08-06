import { CreateCardUseCase } from '../createCard'
import { CardsRepositoryFactory } from '../../repositories/factories/cards.factory'

export class CreateCardUseCaseFactory {
  static make(): CreateCardUseCase {
    const repository = CardsRepositoryFactory.make()
    return new CreateCardUseCase(repository)
  }
}
