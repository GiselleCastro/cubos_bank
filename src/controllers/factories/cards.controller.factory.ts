import { CardsController } from "../cards.controller";
import { CardsService } from '../services/cards.service';

export class CardsControllerFactory {
  static make(): CardsController {
    const service = new CardsService();
    return new CardsController(service);
  }
}