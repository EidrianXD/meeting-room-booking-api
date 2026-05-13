import { Booking } from "../../src/domain/entities/Booking";
import { IBookingRepository } from "../../src/domain/repositories/IBookingRepository";

export class InMemoryBookingRepository implements IBookingRepository {
  public items: Booking[] = [];

  async findById(id: string): Promise<Booking | null> {
    return this.items.find((b) => b.id === id) ?? null;
  }

  async findByRoomId(roomId: string): Promise<Booking[]> {
    return this.items.filter((b) => b.roomId === roomId);
  }

  async findAll(filters?: { roomId?: string; userId?: string }): Promise<Booking[]> {
    return this.items.filter((b) => {
      if (filters?.roomId && b.roomId !== filters.roomId) return false;
      if (filters?.userId && b.userId !== filters.userId) return false;
      return true;
    });
  }

  async create(booking: Booking): Promise<Booking> {
    this.items.push(booking);
    return booking;
  }

  async delete(id: string): Promise<void> {
    this.items = this.items.filter((b) => b.id !== id);
  }
}
