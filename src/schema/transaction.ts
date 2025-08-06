import { minLength, z } from 'zod'

export const createTransactionBodySchema = z.object({
  value: z.number(),
  description: z.string().min(1, 'Required field.'),
})

export const createInternalTransferBodySchema = z.object({
  receiverAccountId: z.uuid(),
  value: z.number(),
  description: z.string().min(1, 'Required field.'),
})
