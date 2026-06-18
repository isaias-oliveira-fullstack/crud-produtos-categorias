import { Router } from "express";
import { validateOrderBody } from "../middlewares/validateBody";
import { validateData } from "../middlewares/validateData";
import { ordersController } from "../controllers/orders.controller";
import { createOrderSchema, updateOrderSchema, orderParamsSchema } from "../schemas/orders.schema";

export const ordersRouter = Router();

ordersRouter.get("/", ordersController.list);
ordersRouter.get("/:id", validateData(orderParamsSchema, "params"), ordersController.getById);
ordersRouter.post("/", validateOrderBody, validateData(createOrderSchema, "body"), ordersController.create);
ordersRouter.patch("/:id", validateOrderBody, validateData(orderParamsSchema, "params"), validateData(updateOrderSchema, "body"), ordersController.update);
ordersRouter.delete("/:id", validateData(orderParamsSchema, "params"), ordersController.delete);
