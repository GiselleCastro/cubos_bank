import type { v4 as uuid } from 'uuid'
import { z } from 'zod'
import { paginationSchema } from '../schema'

export type UUID = typeof uuid

export type Pagination = z.infer<typeof paginationSchema>
