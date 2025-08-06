import { z } from 'zod'
import { createCardBodySchema } from '../schema/account'

import { listOfCardsBodySchema } from '../schema/card'

export type CreateCardData = z.infer<typeof createCardBodySchema>

export type CreateCard = CreateCardData & {
  id: string
  accountId: string
}

export type CreateCardReturn = CreateCardData & {
  id: string
  createdAt: Date
  updatedAt: Date
}

type Pagination = z.infer<typeof listOfCardsBodySchema>

export type PaginationByUser = Pagination & {
  userId: string
}

export type CreateCardReturnPagination = {
  cards: CreateCardReturn[]
  pagination: Pagination
}
