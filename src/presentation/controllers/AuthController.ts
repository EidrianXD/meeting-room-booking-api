import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { LoginUser } from "../../application/use-cases/LoginUser";

const loginSchema = z.object({
  username: z.string().min(1, "username é obrigatório"),
  password: z.string().min(1, "password é obrigatório"),
});

export class AuthController {
  constructor(private readonly loginUser: LoginUser) {}

  login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const body = loginSchema.parse(req.body);
      const result = await this.loginUser.execute(body);
      res.status(200).json(result);
    } catch (err) {
      next(err);
    }
  };
}
