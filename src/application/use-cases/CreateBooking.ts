import { randomUUID } from "node:crypto";
import { Booking } from "../../domain/entities/Booking";
import { AppError } from "../../domain/errors/AppError";
import { BookingConflictError } from "../../domain/errors/BookingConflictError";
import { NotFoundError } from "../../domain/errors/NotFoundError";
import { IBookingRepository } from "../../domain/repositories/IBookingRepository";

export type RoomExists = (roomId: string) => Promise<boolean>;

export interface CreateBookingInput {
  roomId: string;
  userId: string;
  title: string;
  startTime: Date;
  endTime: Date;
}

export class CreateBooking {
  constructor(
    private readonly bookingRepository: IBookingRepository,
    private readonly roomExists: RoomExists,
    private readonly now: () => Date = () => new Date(),
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    const title = input.title?.trim() ?? "";
    if (title.length === 0) {
      throw new AppError("O título da reserva é obrigatório.", 400);
    }

    if (Number.isNaN(input.startTime.getTime()) || Number.isNaN(input.endTime.getTime())) {
      throw new AppError("Datas inválidas.", 400);
    }

    if (input.startTime.getTime() < this.now().getTime()) {
      throw new AppError("A reserva não pode começar no passado.", 400);
    }

    if (input.startTime.getTime() >= input.endTime.getTime()) {
      throw new AppError("startTime deve ser anterior a endTime.", 400);
    }

    if (!(await this.roomExists(input.roomId))) {
      throw new NotFoundError("Sala não encontrada.");
    }

    const candidate = new Booking(
      randomUUID(),
      input.roomId,
      input.userId,
      title,
      input.startTime,
      input.endTime,
    );

    const existing = await this.bookingRepository.findByRoomId(input.roomId);
    if (existing.some((b) => candidate.conflictsWith(b))) {
      throw new BookingConflictError();
    }

    return this.bookingRepository.create(candidate);
  }
}
