import { z } from 'zod'
import {
  createTransactionBodySchema,
  createInternalTransferBodySchema,
  transactionPaginationSchema,
} from '../schema/transactions'
import { TransactionType } from '@prisma/client'
import { Pagination } from '.'

export type CreateTransactionData = z.infer<typeof createTransactionBodySchema>

export type CreateTransactionReturn = CreateTransactionData & {
  id: string
  createdAt: Date
  updatedAt: Date
}

export type CreateTransaction = CreateTransactionData & {
  id: string
  accountId: string
  type: TransactionType
  isReverted?: boolean
  reversedById?: string
}

export type RevertTransaction = CreateTransaction & {
  reversedById: string
}

export type PaginationByTransaction = z.infer<typeof transactionPaginationSchema> & {
  accountId: string
}

export type TransactionsReturnPagination = {
  transactions: CreateTransactionReturn[]
  pagination: Pagination
}

export type CreateInternalTransferData = z.infer<typeof createInternalTransferBodySchema>

export type CreateInternalTransferReturn = CreateTransactionData & {
  id: string
  type: TransactionType
  accountId: string
}
