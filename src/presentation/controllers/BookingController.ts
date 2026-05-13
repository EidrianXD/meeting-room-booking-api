import type { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { CancelBooking } from "../../application/use-cases/CancelBooking";
import { CreateBooking } from "../../application/use-cases/CreateBooking";
import { ListBookings } from "../../application/use-cases/ListBookings";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError";

const isoDate = z
  .string()
  .datetime({ message: "Data deve estar no formato ISO-8601 (ex: 2030-01-01T09:00:00Z)." })
  .transform((s) => new Date(s));

const createSchema = z.object({
  roomId: z.string().min(1),
  title: z.string().min(1, "title é obrigatório"),
  startTime: isoDate,
  endTime: isoDate,
});

const listSchema = z.object({
  roomId: z.string().min(1).optional(),
  userId: z.string().min(1).optional(),
});

const idParamSchema = z.object({ id: z.string().min(1) });

function requireUserId(req: Request): string {
  if (!req.userId) throw new UnauthorizedError("Token inválido.");
  return req.userId;
}

export class BookingController {
  constructor(
    private readonly createBooking: CreateBooking,
    private readonly listBookings: ListBookings,
    private readonly cancelBooking: CancelBooking,
  ) {}

  list = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = listSchema.parse(req.query);
      const bookings = await this.listBookings.execute(filters);
      res.status(200).json(bookings);
    } catch (err) {
      next(err);
    }
  };

  create = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const body = createSchema.parse(req.body);
      const booking = await this.createBooking.execute({ ...body, userId });
      res.status(201).json(booking);
    } catch (err) {
      next(err);
    }
  };

  cancel = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const userId = requireUserId(req);
      const { id } = idParamSchema.parse(req.params);
      await this.cancelBooking.execute({ bookingId: id, userId });
      res.status(204).send();
    } catch (err) {
      next(err);
    }
  };
}
