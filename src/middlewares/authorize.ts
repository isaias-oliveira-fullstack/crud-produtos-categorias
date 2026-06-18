import type { Request, Response, NextFunction } from "express";
import { ForbiddenError } from "../utils/HttpError";

export function authorize(role: "admin") {
  return (req: Request, _res: Response, next: NextFunction): void => {
    const authorization = req.headers["authorization"];
    const token = typeof authorization === "string" ? authorization.trim() : undefined;

    if (role === "admin" && token !== "Bearer admin-token") {
      throw new ForbiddenError("Acesso administrativo negado.");
    }

    next();
  };
}
