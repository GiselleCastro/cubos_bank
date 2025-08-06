import type { CardsRepository } from '../repositories/cards';
import { AppError, BadRequestError, ConflictError, InternalServerError } from "../err/appError";
import { CreateCardData, CreateCardReturn } from '../types/cards'
import { v4 as uuid } from 'uuid';
import { CardType } from '@prisma/client';

export class CreateCardUseCase {
  constructor(
  private readonly cardsRepository : CardsRepository
) {}

  async execute(data: CreateCardData, accountId: string): Promise<CreateCardReturn> {
   data.number = data.number.replace(/\D/g, '')

    try{
    if(data.type == CardType.physical){
      const registeredAccounts = await this.cardsRepository.findByAccountIdAndType(accountId, data.type);
      console.log(registeredAccounts)
      if (registeredAccounts){
        throw new ConflictError('There is already a physical card for this account')
      }
    }

    const cardFound = await this.cardsRepository.findByCardNumber(data.number);
    console.log(cardFound, ">>")
    if (cardFound){
        throw new ConflictError('This card already exists.')
      }


    const newCard = await this.cardsRepository.create({id: uuid(), ...data, accountId});
    
    const startingPositionOfTheLastFourDigitsOfTheCard = 12

    const card = {
      id: newCard.id,
      type: newCard.type,
      number: newCard.number.substring(startingPositionOfTheLastFourDigitsOfTheCard),
      cvv: newCard.cvv,
      createdAt: newCard.createdAt,
      updatedAt: newCard.updatedAt
    } 

    return card

  }catch (error: any){
    if (error instanceof AppError) throw error
    throw new InternalServerError(error?.message || 'Error in the process of creating a person.')
  }}

}