import type { Express } from 'express'
import { buildServer } from '../../src/app'
import { faker } from '@faker-js/faker'
import request from 'supertest'
import { HttpStatusCode } from 'axios'
import { LoginUseCase } from '../../src/use-cases/login'
import { CreateUserUseCase } from '../../src/use-cases/createUser'
import { BadRequestError } from '../../src/err/appError'

jest.mock('../../src/middlewares/schemaValidation')
jest.mock('../../src/use-cases/createUser')
jest.mock('../../src/use-cases/login')

jest.mock('../../src/middlewares/schemaValidation', () => ({
  ValidateSchemaMiddleware: {
    handle: jest.fn(() => (req, res, next) => next()),
  },
  Params: { BODY: 'body' },
}))

describe('POST /login', () => {
  let serverStub: Express

  beforeAll(async () => {
    serverStub = await buildServer()
  })

  afterAll(async () => {})

  it('should return status 200 and the token', async () => {
    const loginInput = {
      document: faker.internet.email(),
      password: faker.internet.password(),
    }

    const tokenMock = faker.internet.jwt()

    const loginUseCaseSpy = jest
      .spyOn(LoginUseCase.prototype, 'execute')
      .mockResolvedValue({
        token: tokenMock,
      })

    const response = await request(serverStub)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(loginInput)

    expect(response.statusCode).toBe(HttpStatusCode.Ok)
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(response.body).toEqual({
      token: tokenMock,
    })
    expect(loginUseCaseSpy).toHaveBeenCalledWith(loginInput)

    loginUseCaseSpy.mockRestore()
  })

  it('should return status 400 and the error when generating the token', async () => {
    const loginInput = {
      document: faker.internet.email(),
      password: faker.internet.password(),
    }

    const loginUseCaseSpy = jest
      .spyOn(LoginUseCase.prototype, 'execute')
      .mockRejectedValue(new BadRequestError('error'))

    const response = await request(serverStub)
      .post('/login')
      .set('Content-Type', 'application/json')
      .send(loginInput)

    expect(response.statusCode).toBe(HttpStatusCode.BadRequest)
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(response.body).toEqual({
      message: 'error',
    })
    expect(loginUseCaseSpy).toHaveBeenCalledWith(loginInput)

    loginUseCaseSpy.mockRestore()
  })
})

describe('POST /people', () => {
  let serverStub: Express

  beforeAll(async () => {
    serverStub = await buildServer()
  })

  afterAll(async () => {})

  it('should return status 201 and create user', async () => {
    const createInput = {
      name: faker.person.firstName(),
      document: faker.internet.email(),
      password: faker.internet.password(),
    }

    const newUser = {
      ...createInput,
      id: faker.string.uuid(),
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const createUserUseCaseSpy = jest
      .spyOn(CreateUserUseCase.prototype, 'execute')
      .mockResolvedValue(newUser)

    const response = await request(serverStub)
      .post('/people')
      .set('Content-Type', 'application/json')
      .send(createInput)

    expect(response.statusCode).toBe(HttpStatusCode.Created)
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')

    const newUserDateToString = {
      ...newUser,
      createdAt: newUser.createdAt.toISOString(),
      updatedAt: newUser.updatedAt.toISOString(),
    }

    expect(response.body).toEqual(newUserDateToString)
    expect(createUserUseCaseSpy).toHaveBeenCalledWith(createInput)

    createUserUseCaseSpy.mockRestore()
  })

  it('should return status 400 if there is an error creating the usern', async () => {
    const createInput = {
      name: faker.person.firstName(),
      document: faker.internet.email(),
      password: faker.internet.password(),
    }

    const createUserUseCaseSpy = jest
      .spyOn(CreateUserUseCase.prototype, 'execute')
      .mockRejectedValue(new BadRequestError('error'))

    const response = await request(serverStub)
      .post('/people')
      .set('Content-Type', 'application/json')
      .send(createInput)

    expect(response.statusCode).toBe(HttpStatusCode.BadRequest)
    expect(response.headers['content-type']).toBe('application/json; charset=utf-8')
    expect(response.body).toEqual({
      message: 'error',
    })
    expect(createUserUseCaseSpy).toHaveBeenCalledWith(createInput)

    createUserUseCaseSpy.mockRestore()
  })
})
