import type { RequestHandler } from "express";
import jwt from "jsonwebtoken";
import { UnauthorizedError } from "../../domain/errors/UnauthorizedError";

interface JwtPayload {
  sub: string;
  username: string;
}

export function makeAuthMiddleware(jwtSecret: string): RequestHandler {
  return (req, _res, next) => {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return next(new UnauthorizedError("Token de autenticação ausente."));
    }

    const token = header.slice("Bearer ".length).trim();
    if (!token) {
      return next(new UnauthorizedError("Token de autenticação ausente."));
    }

    try {
      const payload = jwt.verify(token, jwtSecret) as JwtPayload;
      req.userId = payload.sub;
      req.username = payload.username;
      return next();
    } catch {
      return next(new UnauthorizedError("Token inválido ou expirado."));
    }
  };
}
