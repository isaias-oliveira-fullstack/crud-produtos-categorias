import type { AnyZodObject } from "zod";
import type { Request, Response, NextFunction } from "express";

export function validateData(
  schema: AnyZodObject,
  property: "body" | "query" | "params" = "body"
) {
  return (req: Request, res: Response, next: NextFunction) => {
    const result = schema.safeParse(req[property]);
    if (!result.success) {
      return res.status(400).json({ errors: result.error.format() });
    }

    req[property] = result.data as any;
    return next();
  };
}
