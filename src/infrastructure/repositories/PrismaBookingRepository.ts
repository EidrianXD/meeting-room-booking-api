import type { PrismaClient, Booking as PrismaBooking } from "@prisma/client";
import { Booking } from "../../domain/entities/Booking";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";

export class PrismaBookingRepository implements IBookingRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findById(id: string): Promise<Booking | null> {
    const row = await this.prisma.booking.findUnique({ where: { id } });
    return row ? this.toDomain(row) : null;
  }

  async findByRoomId(roomId: string): Promise<Booking[]> {
    const rows = await this.prisma.booking.findMany({ where: { roomId } });
    return rows.map((r) => this.toDomain(r));
  }

  async findAll(filters?: { roomId?: string; userId?: string }): Promise<Booking[]> {
    const rows = await this.prisma.booking.findMany({
      where: {
        ...(filters?.roomId ? { roomId: filters.roomId } : {}),
        ...(filters?.userId ? { userId: filters.userId } : {}),
      },
      orderBy: { startTime: "asc" },
    });
    return rows.map((r) => this.toDomain(r));
  }

  async create(booking: Booking): Promise<Booking> {
    const row = await this.prisma.booking.create({
      data: {
        id: booking.id,
        roomId: booking.roomId,
        userId: booking.userId,
        title: booking.title,
        startTime: booking.startTime,
        endTime: booking.endTime,
        createdAt: booking.createdAt,
      },
    });
    return this.toDomain(row);
  }

  async delete(id: string): Promise<void> {
    await this.prisma.booking.delete({ where: { id } });
  }

  private toDomain(row: PrismaBooking): Booking {
    return new Booking(
      row.id,
      row.roomId,
      row.userId,
      row.title,
      row.startTime,
      row.endTime,
      row.createdAt,
    );
  }
}
