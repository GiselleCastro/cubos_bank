import type { Request, Response } from 'express';
import type { CreateUserUseCase } from '../use-cases/createUser';
import type { LoginUseCase } from '../use-cases/login';

export class UsersController {
  constructor(private readonly createUserUseCase: CreateUserUseCase,
private readonly loginUseCase: LoginUseCase
  ) {}

  registerUser(){
  return async (req: Request, res: Response) => {
    try {
      const result = await this.createUserUseCase.execute(req.body);
      return res.status(201).json(result);
    } catch (error) {
      console.error(error)
      return res.status(500).json({ error: 'Erro ao registrar usuário' });
    }
  }}

  login() {
    return async (req: Request, res: Response)=> {
      try {
        const result = await this.loginUseCase.execute(req.body);
        return res.status(200).json(result);
      } catch (error) {
        console.error(error)
        return res.status(401).json({ error: 'Login inválido' });
      }
    }
  }
}
