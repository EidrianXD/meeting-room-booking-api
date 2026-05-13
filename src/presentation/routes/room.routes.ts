import { Router, type RequestHandler } from "express";
import { RoomController } from "../controllers/RoomController";

export function makeRoomRouter(controller: RoomController, auth: RequestHandler): Router {
  const router = Router();
  router.get("/", auth, controller.list);
  return router;
}
