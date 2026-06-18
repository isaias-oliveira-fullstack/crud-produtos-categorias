import type { Request, Response, NextFunction } from "express";
import { HttpError } from "../utils/HttpError";

export function errorHandler(err: unknown, req: Request, res: Response, next: NextFunction): void {
  if (res.headersSent) {
    return next(err);
  }

  if (err instanceof HttpError) {
    res.status(err.statusCode).json({ message: err.message });
    return;
  }

  if (err instanceof SyntaxError && "body" in err) {
    res.status(400).json({ message: "JSON inválido no corpo da requisição." });
    return;
  }

  console.error(err);
  res.status(500).json({ message: "Erro interno do servidor." });
}
