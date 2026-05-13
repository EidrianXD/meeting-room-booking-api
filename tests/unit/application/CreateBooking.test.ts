import { describe, it, expect, beforeEach } from "vitest";
import { CreateBooking } from "../../../src/application/use-cases/CreateBooking";
import { Booking } from "../../../src/domain/entities/Booking";
import { AppError } from "../../../src/domain/errors/AppError";
import { BookingConflictError } from "../../../src/domain/errors/BookingConflictError";
import { InMemoryBookingRepository } from "../../helpers/InMemoryBookingRepository";

const FIXED_NOW = new Date("2030-01-01T08:00:00Z");

describe("CreateBooking", () => {
  let repo: InMemoryBookingRepository;
  let useCase: CreateBooking;

  beforeEach(() => {
    repo = new InMemoryBookingRepository();
    useCase = new CreateBooking(repo, () => FIXED_NOW);
  });

  it("cria e retorna a reserva quando os dados são válidos", async () => {
    const booking = await useCase.execute({
      roomId: "room-1",
      userId: "user-1",
      title: "Alinhamento",
      startTime: new Date("2030-01-01T09:00:00Z"),
      endTime: new Date("2030-01-01T10:00:00Z"),
    });

    expect(booking).toBeInstanceOf(Booking);
    expect(booking.id).toBeTruthy();
    expect(repo.items).toHaveLength(1);
    expect(repo.items[0]?.id).toBe(booking.id);
  });

  it("lança BookingConflictError quando a sala já está reservada no horário", async () => {
    await useCase.execute({
      roomId: "room-1",
      userId: "user-1",
      title: "Primeira",
      startTime: new Date("2030-01-01T09:00:00Z"),
      endTime: new Date("2030-01-01T10:00:00Z"),
    });

    await expect(
      useCase.execute({
        roomId: "room-1",
        userId: "user-2",
        title: "Sobreposta",
        startTime: new Date("2030-01-01T09:30:00Z"),
        endTime: new Date("2030-01-01T10:30:00Z"),
      }),
    ).rejects.toBeInstanceOf(BookingConflictError);
  });

  it("lança erro quando startTime está no passado", async () => {
    await expect(
      useCase.execute({
        roomId: "room-1",
        userId: "user-1",
        title: "Passado",
        startTime: new Date("2029-12-31T09:00:00Z"),
        endTime: new Date("2029-12-31T10:00:00Z"),
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("lança erro quando startTime >= endTime", async () => {
    await expect(
      useCase.execute({
        roomId: "room-1",
        userId: "user-1",
        title: "Invertido",
        startTime: new Date("2030-01-01T10:00:00Z"),
        endTime: new Date("2030-01-01T09:00:00Z"),
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      useCase.execute({
        roomId: "room-1",
        userId: "user-1",
        title: "Igual",
        startTime: new Date("2030-01-01T10:00:00Z"),
        endTime: new Date("2030-01-01T10:00:00Z"),
      }),
    ).rejects.toBeInstanceOf(AppError);
  });
});
