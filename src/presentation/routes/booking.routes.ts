import { Router, type RequestHandler } from "express";
import { BookingController } from "../controllers/BookingController";

export function makeBookingRouter(controller: BookingController, auth: RequestHandler): Router {
  const router = Router();
  router.use(auth);
  router.get("/", controller.list);
  router.post("/", controller.create);
  router.delete("/:id", controller.cancel);
  return router;
}
