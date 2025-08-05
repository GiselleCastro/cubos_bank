import express from 'express';
import {router as userRoutes } from './src/routes/public.routes'
import {router as accountRoutes } from './src/routes/account.routes'
import {router as cardRoutes } from './src/routes/account.routes'
import {router as transactionRoutes } from './src/routes/transaction.routes'

const app = express();

app.use(express.json());
app.use('/', userRoutes);
app.use('/accounts', accountRoutes);
app.use('/cards', cardRoutes);
app.use('/accounts/:accountId/transactions', transactionRoutes);


export default app;