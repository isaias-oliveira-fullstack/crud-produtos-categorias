import type { Request, Response, NextFunction } from "express";

export function validateOrderBody(req: Request, res: Response, next: NextFunction): void {
  const body = req.body;
  const isEmptyObject = typeof body === "object" && body !== null && Object.keys(body).length === 0;

  if (body === undefined || body === null || isEmptyObject) {
    res.status(400).json({ message: "O corpo da requisição é obrigatório." });
    return;
  }

  next();
}
