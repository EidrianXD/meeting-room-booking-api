import { Booking } from "../entities/Booking";

export interface IBookingRepository {
  findById(id: string): Promise<Booking | null>;
  findByRoomId(roomId: string): Promise<Booking[]>;
  findAll(filters?: { roomId?: string; userId?: string }): Promise<Booking[]>;
  create(booking: Booking): Promise<Booking>;
  delete(id: string): Promise<void>;
}
