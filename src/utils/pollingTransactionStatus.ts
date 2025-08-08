import { env } from '../config/env'
import { PaymentRequiredError, RequestTimeoutError } from '../err/appError'
import { TransactionStatus } from '@prisma/client'

export const wait = (milliseconds: number) => {
  return new Promise((resolve) => setTimeout(resolve, milliseconds))
}

interface GetTransactionById {
  (empontentId: string): Promise<{ data: { status: TransactionStatus } }>
}

export async function pollingTransactionStatus(
  empontentId: string,
  getTransactionById: GetTransactionById,
  maxRetry: number = env.TRANSACTION_COMPILANCE_API_POLLING_MAX_RETRY,
  delayMilisecons: number = env.TRANSACTION_COMPILANCE_API_POLLING_DELAY_MS,
): Promise<TransactionStatus> {
  let retry = 0

  while (retry <= maxRetry) {
    try {
      const { data } = await getTransactionById(empontentId)
      const { status } = data

      if (status === TransactionStatus.authorized) {
        return status
      }

      if (status === TransactionStatus.unauthorized) {
        throw new PaymentRequiredError('Payment refused by Compilance API.')
      }

      if (retry === maxRetry && status === TransactionStatus.processing) {
        return status
      }
    } catch (error) {
      if (retry >= maxRetry || error instanceof PaymentRequiredError) {
        throw error
      }
    }

    await wait(delayMilisecons)
    retry++
  }

  throw new RequestTimeoutError('Polling exceeded max retries without definitive status.')
}
