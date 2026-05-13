import type { ErrorRequestHandler } from "express";
import { ZodError } from "zod";
import { AppError } from "../../domain/errors/AppError";

export const errorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  if (err instanceof ZodError) {
    res.status(400).json({
      error: "Dados inválidos.",
      details: err.issues.map((i) => ({ path: i.path.join("."), message: i.message })),
    });
    return;
  }

  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: err.message });
    return;
  }

  console.error("[unhandled]", err);
  res.status(500).json({ error: "Erro interno do servidor." });
};
