import { z } from "zod";
import { createAccountBodySchema } from "../schema/account";

export type CreateAccountData = z.infer<typeof createAccountBodySchema>;

export type CreateAccountReturn = CreateAccountData & {
  id: string;
createdAt: Date;
updatedAt: Date;
}

export type AccountType = CreateAccountReturn
