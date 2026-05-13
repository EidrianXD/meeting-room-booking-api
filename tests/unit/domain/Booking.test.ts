import { describe, it, expect } from "vitest";
import { Booking } from "../../../src/domain/entities/Booking";

function make(id: string, start: string, end: string, roomId = "room-1"): Booking {
  return new Booking(id, roomId, "user-1", "Reunião", new Date(start), new Date(end));
}

describe("Booking.conflictsWith", () => {
  it("retorna true quando há sobreposição de horário na mesma sala", () => {
    const a = make("a", "2030-01-01T09:00:00Z", "2030-01-01T10:00:00Z");
    const b = make("b", "2030-01-01T09:30:00Z", "2030-01-01T10:30:00Z");
    expect(a.conflictsWith(b)).toBe(true);
    expect(b.conflictsWith(a)).toBe(true);
  });

  it("retorna false quando reservas são adjacentes (sem sobreposição)", () => {
    const a = make("a", "2030-01-01T09:00:00Z", "2030-01-01T10:00:00Z");
    const b = make("b", "2030-01-01T10:00:00Z", "2030-01-01T11:00:00Z");
    expect(a.conflictsWith(b)).toBe(false);
    expect(b.conflictsWith(a)).toBe(false);
  });

  it("retorna false quando uma termina antes da outra começar", () => {
    const a = make("a", "2030-01-01T09:00:00Z", "2030-01-01T10:00:00Z");
    const b = make("b", "2030-01-01T11:00:00Z", "2030-01-01T12:00:00Z");
    expect(a.conflictsWith(b)).toBe(false);
    expect(b.conflictsWith(a)).toBe(false);
  });

  it("retorna false quando salas são diferentes mesmo com horário sobreposto", () => {
    const a = make("a", "2030-01-01T09:00:00Z", "2030-01-01T10:00:00Z", "room-1");
    const b = make("b", "2030-01-01T09:30:00Z", "2030-01-01T10:30:00Z", "room-2");
    expect(a.conflictsWith(b)).toBe(false);
  });
});

describe("Booking constructor", () => {
  it("lança erro quando startTime é data inválida", () => {
    expect(
      () =>
        new Booking(
          "id",
          "room-1",
          "user-1",
          "Reunião",
          new Date("invalid"),
          new Date("2030-01-01T10:00:00Z"),
        ),
    ).toThrow(/startTime/);
  });

  it("lança erro quando endTime é data inválida", () => {
    expect(
      () =>
        new Booking(
          "id",
          "room-1",
          "user-1",
          "Reunião",
          new Date("2030-01-01T09:00:00Z"),
          new Date("invalid"),
        ),
    ).toThrow(/endTime/);
  });
});
