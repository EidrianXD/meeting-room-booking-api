import { describe, it, expect, beforeEach } from "vitest";
import { CreateBooking, RoomExists } from "../../../src/application/use-cases/CreateBooking";
import { Booking } from "../../../src/domain/entities/Booking";
import { AppError } from "../../../src/domain/errors/AppError";
import { BookingConflictError } from "../../../src/domain/errors/BookingConflictError";
import { NotFoundError } from "../../../src/domain/errors/NotFoundError";
import { InMemoryBookingRepository } from "../../helpers/InMemoryBookingRepository";

const FIXED_NOW = new Date("2030-01-01T08:00:00Z");
const VALID_INPUT = {
  roomId: "room-1",
  userId: "user-1",
  title: "Alinhamento",
  startTime: new Date("2030-01-01T09:00:00Z"),
  endTime: new Date("2030-01-01T10:00:00Z"),
};

describe("CreateBooking", () => {
  let repo: InMemoryBookingRepository;
  let useCase: CreateBooking;
  const roomExistsAlways: RoomExists = async () => true;

  beforeEach(() => {
    repo = new InMemoryBookingRepository();
    useCase = new CreateBooking(repo, roomExistsAlways, () => FIXED_NOW);
  });

  it("cria e retorna a reserva quando os dados são válidos", async () => {
    const booking = await useCase.execute(VALID_INPUT);

    expect(booking).toBeInstanceOf(Booking);
    expect(booking.id).toBeTruthy();
    expect(repo.items).toHaveLength(1);
    expect(repo.items[0]?.id).toBe(booking.id);
  });

  it("lança BookingConflictError quando a sala já está reservada no horário", async () => {
    await useCase.execute(VALID_INPUT);

    await expect(
      useCase.execute({
        ...VALID_INPUT,
        userId: "user-2",
        title: "Sobreposta",
        startTime: new Date("2030-01-01T09:30:00Z"),
        endTime: new Date("2030-01-01T10:30:00Z"),
      }),
    ).rejects.toBeInstanceOf(BookingConflictError);
  });

  it("permite reservar a mesma faixa em salas diferentes", async () => {
    await useCase.execute(VALID_INPUT);

    const outra = await useCase.execute({ ...VALID_INPUT, roomId: "room-2" });
    expect(outra).toBeInstanceOf(Booking);
    expect(repo.items).toHaveLength(2);
  });

  it("lança erro quando startTime está no passado", async () => {
    await expect(
      useCase.execute({
        ...VALID_INPUT,
        startTime: new Date("2029-12-31T09:00:00Z"),
        endTime: new Date("2029-12-31T10:00:00Z"),
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("lança erro quando startTime >= endTime", async () => {
    await expect(
      useCase.execute({
        ...VALID_INPUT,
        startTime: new Date("2030-01-01T10:00:00Z"),
        endTime: new Date("2030-01-01T09:00:00Z"),
      }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      useCase.execute({
        ...VALID_INPUT,
        startTime: new Date("2030-01-01T10:00:00Z"),
        endTime: new Date("2030-01-01T10:00:00Z"),
      }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("lança erro quando datas são inválidas (NaN)", async () => {
    await expect(
      useCase.execute({ ...VALID_INPUT, startTime: new Date("not-a-date") }),
    ).rejects.toBeInstanceOf(AppError);

    await expect(
      useCase.execute({ ...VALID_INPUT, endTime: new Date("not-a-date") }),
    ).rejects.toBeInstanceOf(AppError);
  });

  it("lança erro quando o título é vazio ou só espaços", async () => {
    await expect(useCase.execute({ ...VALID_INPUT, title: "" })).rejects.toBeInstanceOf(AppError);
    await expect(useCase.execute({ ...VALID_INPUT, title: "   " })).rejects.toBeInstanceOf(
      AppError,
    );
  });

  it("lança NotFoundError quando a sala não existe", async () => {
    const useCaseSemSala = new CreateBooking(repo, async () => false, () => FIXED_NOW);
    await expect(useCaseSemSala.execute(VALID_INPUT)).rejects.toBeInstanceOf(NotFoundError);
  });
});
