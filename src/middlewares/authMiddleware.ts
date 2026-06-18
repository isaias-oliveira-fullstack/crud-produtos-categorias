import type { Request, Response, NextFunction } from "express";
import { UnauthorizedError } from "../utils/HttpError";

export function authMiddleware(req: Request, _res: Response, next: NextFunction): void {
  const authorization = req.headers["authorization"];
  const token = typeof authorization === "string" ? authorization.trim() : undefined;

  if (!token || token !== "Bearer admin-token") {
    throw new UnauthorizedError("Token de autenticação inválido ou ausente.");
  }

  next();
}
