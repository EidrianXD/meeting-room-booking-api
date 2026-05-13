import { ForbiddenError } from "../../domain/errors/ForbiddenError";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";

export interface CancelBookingInput {
  bookingId: string;
  userId: string;
}

export class CancelBooking {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(input: CancelBookingInput): Promise<void> {
    const booking = await this.bookingRepository.findById(input.bookingId);
    if (!booking) {
      throw new NotFoundError("Reserva não encontrada.");
    }

    if (booking.userId !== input.userId) {
      throw new ForbiddenError("Apenas o criador da reserva pode cancelá-la.");
    }

    await this.bookingRepository.delete(booking.id);
  }
}
