import type { Request, Response, NextFunction } from 'express'
import { AppError } from '../err/appError'
import { HttpStatusCode } from 'axios'

export class ErrorHandler {
  static handle() {
    return (error: any, req: Request, res: Response, next: NextFunction) => {
      if (error instanceof AppError) {
        return res.status(error.statusCode).json({
          message: error.message,
        })
      }

      return res.status(HttpStatusCode.InternalServerError).json({
        message: `Unknown error - ${error?.message}`,
      })
    }
  }
}
