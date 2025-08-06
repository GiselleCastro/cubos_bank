import type { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { ZodObject } from 'zod';

enum Params {
  BODY = 'body', 
  QUERY = 'query'
}
type ParamType = Params.BODY | Params.QUERY

export class ValidateSchemaMiddleware {
  static handle(schema: ZodObject, param: ParamType = Params.BODY) {
    return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
      try {
        await schema.parseAsync(req[param]);
        next();
      } catch (err: any) {
        res.status(HttpStatusCode.UnprocessableEntity).json({
          details: err.issues,
        });
      }
    };
  }
}
