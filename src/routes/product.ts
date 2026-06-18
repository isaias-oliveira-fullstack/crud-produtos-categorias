import { Router } from "express";
import { productController } from "../controllers/product.controller";
import { validateData } from "../middlewares/validateData";
import { authMiddleware } from "../middlewares/authMiddleware";
import { authorize } from "../middlewares/authorize";
import {
  ProductCreateSchema,
  ProductUpdateSchema,
  ProductParamsSchema,
  ProductQuerySchema,
  ProductSlugParamsSchema,
} from "../schemas/product.schema";

export const productRouter = Router();

productRouter.get("/", validateData(ProductQuerySchema, "query"), productController.getAll);
productRouter.get("/category/:slug", productController.listByCategorySlug);
productRouter.get("/slug/:slug", validateData(ProductSlugParamsSchema, "params"), productController.getBySlug);
productRouter.get("/:id", validateData(ProductParamsSchema, "params"), productController.getById);
productRouter.post(
  "/",
  authMiddleware,
  authorize("admin"),
  validateData(ProductCreateSchema, "body"),
  productController.create
);
productRouter.put(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validateData(ProductParamsSchema, "params"),
  validateData(ProductUpdateSchema, "body"),
  productController.update
);
productRouter.delete(
  "/:id",
  authMiddleware,
  authorize("admin"),
  validateData(ProductParamsSchema, "params"),
  productController.delete
);
