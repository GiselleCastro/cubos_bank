import express from 'express'
import { router as userRoutes } from './routes/public.routes'
import { router as accountRoutes } from './routes/accounts.routes'
import { router as cardRoutes } from './routes/cards.routes'
import { router as transactionRoutes } from './routes/transactions.routes'
import { ErrorHandler } from './middlewares/errorHandler'

const app = express()

app.use(express.json())
app.use('/', userRoutes)
app.use('/accounts', accountRoutes)
app.use('/cards', cardRoutes)
app.use('/accounts/:accountId/transactions', transactionRoutes)
app.use(ErrorHandler.handle())

export default app
