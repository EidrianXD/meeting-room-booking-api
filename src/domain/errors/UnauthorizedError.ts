import { AppError } from "./AppError";

export class UnauthorizedError extends AppError {
  constructor(message: string = "Operação não autorizada.") {
    super(message, 403);
  }
}
