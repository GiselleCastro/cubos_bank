import type { UsersRepository } from "../repositories/users";
import type { LoginDataLoginData, Token } from "../types/user.js";
import { compare } from 'bcrypt'
import jwt from 'jsonwebtoken';
import { env } from "../config/env";

export class LoginUseCase {
  constructor(
  private readonly usersRepository : UsersRepository) {}

  async execute(data: LoginDataLoginData): Promise<Token | null> {
    const userFound = await this.usersRepository.findByDocument(data.document);

    if (!userFound) {
      throw new Error('messageError.NON_EXISTENTE_USER');
    }

    const checkPassword = await compare(data.password, userFound.passwordHash);

    if (!checkPassword) {
      throw new Error('messageError.PASSWORD_DOES_NOT_MATCH');
    }

    const token = this.generateToken(userFound.id);

    const tokenBearer = {
      token: `Bearer ${token}`
    }
    

    return tokenBearer
  }

  private generateToken(
    userId: string) {

    const payload = {
      id: userId,
    };

    const token =jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_SECRET_EXPIRES_IN_SECONDS });
    return token;
  }
}
