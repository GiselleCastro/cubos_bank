import type { UsersRepository } from '../repositories/users'
import type { CreateUserPayload, CreateUserReturn } from '../types/users.js'
import { v4 as uuid } from 'uuid'
import { genSalt, hash } from 'bcrypt'
import { CompilanceAPI } from '../infrastructure/compilanceAPI'
import { ValidationDocumentType } from '../infrastructure/compilanceAPI'
import {
  AppError,
  BadRequestError,
  InternalServerError,
  UnprocessableEntityError,
} from '../err/appError'

enum DocumentLength {
  CPF = 11,
  CNPJ = 14,
}
export class CreateUserUseCase {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly compilanceAPI: CompilanceAPI,
  ) {}
  async execute(data: CreateUserPayload): Promise<CreateUserReturn> {
    data.document = data.document.replace(/\D/g, '')

    try {
      const userRegister = await this.usersRepository.findByDocument(data.document)

      if (userRegister) {
        throw new BadRequestError('Document already registered.')
      }

      let documentAnalysis: ValidationDocumentType

      if (data.document.length == DocumentLength.CPF) {
        documentAnalysis = await this.compilanceAPI.validateCPF({
          document: data.document,
        })
      } else if (data.document.length == DocumentLength.CNPJ) {
        documentAnalysis = await this.compilanceAPI.validateCNPJ({
          document: data.document,
        })
      } else {
        throw new UnprocessableEntityError('Invalid document type.')
      }

      const statusCorrespondingToTheValidDocument = 1

      if (documentAnalysis?.status !== statusCorrespondingToTheValidDocument) {
        throw new UnprocessableEntityError('Invalid document.')
      }

      const salt = await genSalt(12)
      const passwordHash = await hash(data.password, salt)

      const newUser = await this.usersRepository.create({
        id: uuid(),
        passwordHash: passwordHash,
        name: data.name,
        document: data.document,
      })
      const userData = {
        id: newUser.id,
        name: newUser.name,
        document: newUser.document,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      }
      return userData
    } catch (error: any) {
      if (error instanceof AppError) throw error
      throw new InternalServerError(
        error?.message || 'Error in the process of creating a person.',
      )
    }
  }
}
