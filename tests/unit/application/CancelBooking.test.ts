import { describe, it, expect, beforeEach } from "vitest";
import { CancelBooking } from "../../../src/application/use-cases/CancelBooking";
import { Booking } from "../../../src/domain/entities/Booking";
import { NotFoundError } from "../../../src/domain/errors/NotFoundError";
import { ForbiddenError } from "../../../src/domain/errors/ForbiddenError";
import { InMemoryBookingRepository } from "../../helpers/InMemoryBookingRepository";

describe("CancelBooking", () => {
  let repo: InMemoryBookingRepository;
  let useCase: CancelBooking;

  beforeEach(() => {
    repo = new InMemoryBookingRepository();
    useCase = new CancelBooking(repo);
  });

  function seedBooking(userId: string): Booking {
    const booking = new Booking(
      "booking-1",
      "room-1",
      userId,
      "Reunião",
      new Date("2030-01-01T09:00:00Z"),
      new Date("2030-01-01T10:00:00Z"),
    );
    repo.items.push(booking);
    return booking;
  }

  it("remove a reserva com sucesso quando o solicitante é o criador", async () => {
    seedBooking("user-1");

    await useCase.execute({ bookingId: "booking-1", userId: "user-1" });

    expect(repo.items).toHaveLength(0);
  });

  it("lança ForbiddenError quando o solicitante não é o criador", async () => {
    seedBooking("user-1");

    await expect(
      useCase.execute({ bookingId: "booking-1", userId: "user-2" }),
    ).rejects.toBeInstanceOf(ForbiddenError);

    expect(repo.items).toHaveLength(1);
  });

  it("lança NotFoundError quando a reserva não existe", async () => {
    await expect(
      useCase.execute({ bookingId: "inexistente", userId: "user-1" }),
    ).rejects.toBeInstanceOf(NotFoundError);
  });
});
