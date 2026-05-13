import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";

export interface ListBookingsInput {
  roomId?: string;
  userId?: string;
}

export class ListBookings {
  constructor(private readonly bookingRepository: IBookingRepository) {}

  async execute(input: ListBookingsInput = {}): Promise<Booking[]> {
    return this.bookingRepository.findAll({
      roomId: input.roomId,
      userId: input.userId,
    });
  }
}
