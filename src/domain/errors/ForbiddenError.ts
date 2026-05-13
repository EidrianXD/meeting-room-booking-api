import { AppError } from "./AppError";

export class ForbiddenError extends AppError {
  constructor(message: string = "Operação não permitida para este usuário.") {
    super(message, 403);
  }
}
