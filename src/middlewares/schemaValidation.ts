import type { Request, Response, NextFunction } from 'express';
import { HttpStatusCode } from 'axios';
import { ZodObject } from 'zod';

export enum Params {
  BODY = 'body', 
  QUERY = 'query',
  PARAMS = 'params'
}
type ParamType = Params.BODY | Params.QUERY | Params.PARAMS

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
