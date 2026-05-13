import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(message: string = "Autenticação requerida.") {
    super(message, 401);
  }
}
