import type { Express } from 'express'
import { buildServer } from '../../src/app'
import request from 'supertest'
import { faker } from '@faker-js/faker'
import { HttpStatusCode } from 'axios'
import { ListOfCardsUseCase } from '../../src/use-cases/listOfCards'
import { InternalServerError } from '../../src/err/appError'
import { CardType } from '@prisma/client'
import { CardsReturnPagination, CreateCardReturn } from '../../src/types/cards'

const userId = faker.string.uuid()

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn((_, __) => {
    return { userId }
  }),
}))
jest.mock('../../src/middlewares/authentication', () => ({
  AuthMiddleware: {
    handle: jest.fn(() => (req, res, next) => {
      req.headers.authorization = userId
      next()
    }),
  },
}))
jest.mock('../../src/use-cases/listOfCards')

describe('GET /cards', () => {
  let serverStub: Express

  beforeAll(async () => {
    serverStub = await buildServer()
  })

  afterAll(async () => {})

  it('should return 200 and the list of cards', async () => {
    const mockCards: CreateCardReturn[] = []
    const numberOfCards = faker.number.int({ min: 0, max: 20 })

    for (let i = 0; i < numberOfCards; i++) {
      mockCards.push({
        id: faker.string.uuid(),
        type: CardType.virtual,
        number: faker.finance.creditCardNumber().replace(/\D/g, '').slice(-4),
        cvv: faker.finance.creditCardCVV(),
        createdAt: faker.date.anytime(),
        updatedAt: faker.date.anytime(),
      })
    }

    const pagination = {
      itemsPerPage: faker.number.int({ min: 0, max: 10 }),
      currentPage: faker.number.int({ min: 1, max: 20 }),
    }

    const startIndex = (pagination.currentPage - 1) * pagination.itemsPerPage
    const endIndex = startIndex + pagination.itemsPerPage
    const cardsOnTheCurrentPage = mockCards.slice(startIndex, endIndex)

    const listCardsPagination: CardsReturnPagination = {
      cards: cardsOnTheCurrentPage,
      pagination,
    }

    const listOfCardsUseCaseSpy = jest
      .spyOn(ListOfCardsUseCase.prototype, 'execute')
      .mockResolvedValue(listCardsPagination)

    const listCardsPaginationDateToString = cardsOnTheCurrentPage.map((i) => ({
      ...i,
      createdAt: i.createdAt.toISOString(),
      updatedAt: i.updatedAt.toISOString(),
    }))

    const listCardsPaginationDisplay = {
      cards: listCardsPaginationDateToString,
      pagination,
    }

    const response = await request(serverStub)
      .get('/cards')
      .set('Authorization', 'Bearer token')
      .query(pagination)

    expect(response.statusCode).toBe(HttpStatusCode.Ok)
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(response.body).toEqual(listCardsPaginationDisplay)
    expect(listOfCardsUseCaseSpy).toHaveBeenCalledWith({
      userId,
      ...pagination,
    })

    listOfCardsUseCaseSpy.mockRestore()
  })

  it('should call next with error and return 500 on failure', async () => {
    const listOfCardsUseCaseSpy = jest
      .spyOn(ListOfCardsUseCase.prototype, 'execute')
      .mockRejectedValue(new InternalServerError('error'))

    const response = await request(serverStub)
      .get('/cards')
      .set('Authorization', 'Bearer token')

    expect(response.statusCode).toBe(HttpStatusCode.InternalServerError)
    expect(response.body).toEqual({ message: 'error' })
    expect(listOfCardsUseCaseSpy).toHaveBeenCalled()

    listOfCardsUseCaseSpy.mockRestore()
  })
})
