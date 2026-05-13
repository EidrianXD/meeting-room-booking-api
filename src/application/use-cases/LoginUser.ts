import jwt from "jsonwebtoken";
import { User } from "../../domain/entities/User";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError";

export type FindUserByUsername = (username: string) => Promise<User | null>;

export interface LoginUserInput {
  username: string;
  password: string;
}

export interface LoginUserOutput {
  token: string;
  user: { id: string; username: string };
}

export class LoginUser {
  constructor(
    private readonly findUserByUsername: FindUserByUsername,
    private readonly jwtSecret: string,
    private readonly tokenExpiresIn: string = "8h",
  ) {}

  async execute(input: LoginUserInput): Promise<LoginUserOutput> {
    const user = await this.findUserByUsername(input.username);
    if (!user || user.password !== input.password) {
      throw new UnauthorizedError("Credenciais inválidas.");
    }

    const token = jwt.sign(
      { sub: user.id, username: user.username },
      this.jwtSecret,
      { expiresIn: this.tokenExpiresIn } as jwt.SignOptions,
    );

    return {
      token,
      user: { id: user.id, username: user.username },
    };
  }
}
