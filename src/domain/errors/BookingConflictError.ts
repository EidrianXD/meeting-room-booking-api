import { AppError } from "./AppError";

export class BookingConflictError extends AppError {
  constructor(message: string = "Já existe uma reserva para esta sala neste horário.") {
    super(message, 409);
  }
}
