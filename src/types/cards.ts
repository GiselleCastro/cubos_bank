import { z } from 'zod'
import { createCardBodySchema } from '../schema/accounts'
import { Pagination } from '.'

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

export type PaginationByUser = Pagination & {
  userId: string
}

export type CardsReturnPagination = {
  cards: CreateCardReturn[]
  pagination: Pagination
}
