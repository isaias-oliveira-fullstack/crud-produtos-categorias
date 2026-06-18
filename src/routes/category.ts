import { Router } from "express";
import { categoryController } from "../controllers/category.controller";
import { validateData } from "../middlewares/validateData";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/authorize";
import { CategoryCreateSchema, CategoryUpdateSchema, CategoryParamsSchema, CategoryQuerySchema } from "../schemas/category.schema";

export const categoryRouter = Router();

categoryRouter.get(
  "/",
  validateData(CategoryQuerySchema, "query"),
  categoryController.getAll
);
categoryRouter.get(
  "/:id",
  validateData(CategoryParamsSchema, "params"),
  categoryController.getById
);
categoryRouter.post(
  "/",
  authMiddleware,
  authorize("admin"),
  validateData(CategoryCreateSchema, "body"),
  categoryController.create
);
categoryRouter.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validateData(CategoryParamsSchema, "params"),
  validateData(CategoryUpdateSchema, "body"),
  categoryController.update
);
categoryRouter.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validateData(CategoryParamsSchema, "params"),
  categoryController.delete
);
