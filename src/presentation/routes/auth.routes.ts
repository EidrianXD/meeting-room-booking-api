import { Router } from "express";
import { AuthController } from "../controllers/AuthController";

export function makeAuthRouter(controller: AuthController): Router {
  const router = Router();
  router.post("/login", controller.login);
  return router;
}
