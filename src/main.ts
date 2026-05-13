import "dotenv/config";
import express from "express";

import { CancelBooking } from "./application/use-cases/CancelBooking";
import { CreateBooking, RoomExists } from "./application/use-cases/CreateBooking";
import { ListBookings } from "./application/use-cases/ListBookings";
import { FindUserByUsername, LoginUser } from "./application/use-cases/LoginUser";
import { User } from "./domain/entities/User";
import { prisma } from "./infrastructure/prisma";
import { PrismaBookingRepository } from "./infrastructure/repositories/PrismaBookingRepository";
import { AuthController } from "./presentation/controllers/AuthController";
import { BookingController } from "./presentation/controllers/BookingController";
import { ListRooms, RoomController } from "./presentation/controllers/RoomController";
import { makeAuthMiddleware } from "./presentation/middlewares/authMiddleware";
import { errorHandler } from "./presentation/middlewares/errorHandler";
import { makeAuthRouter } from "./presentation/routes/auth.routes";
import { makeBookingRouter } from "./presentation/routes/booking.routes";
import { makeRoomRouter } from "./presentation/routes/room.routes";

function requireEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`Variável de ambiente ausente: ${name}`);
  return value;
}

async function bootstrap(): Promise<void> {
  const jwtSecret = requireEnv("JWT_SECRET");
  const port = Number(process.env.PORT ?? 3000);

  const bookingRepository = new PrismaBookingRepository(prisma);

  const findUserByUsername: FindUserByUsername = async (username) => {
    const row = await prisma.user.findUnique({ where: { username } });
    return row ? new User(row.id, row.username, row.password) : null;
  };

  const roomExists: RoomExists = async (roomId) => {
    const row = await prisma.room.findUnique({ where: { id: roomId } });
    return row !== null;
  };

  const listRooms: ListRooms = async () => {
    const rows = await prisma.room.findMany({ orderBy: { id: "asc" } });
    return rows.map((r) => ({ id: r.id, name: r.name }));
  };

  const loginUser = new LoginUser(findUserByUsername, jwtSecret);
  const createBooking = new CreateBooking(bookingRepository, roomExists);
  const listBookings = new ListBookings(bookingRepository);
  const cancelBooking = new CancelBooking(bookingRepository);

  const authController = new AuthController(loginUser);
  const roomController = new RoomController(listRooms);
  const bookingController = new BookingController(createBooking, listBookings, cancelBooking);

  const authMiddleware = makeAuthMiddleware(jwtSecret);

  const app = express();
  app.use(express.json());

  app.get("/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.use("/auth", makeAuthRouter(authController));
  app.use("/rooms", makeRoomRouter(roomController, authMiddleware));
  app.use("/bookings", makeBookingRouter(bookingController, authMiddleware));

  app.use(errorHandler);

  app.listen(port, () => {
    console.log(`API ouvindo em http://localhost:${port}`);
  });
}

bootstrap().catch((err) => {
  console.error("Falha ao iniciar a aplicação:", err);
  process.exit(1);
});
