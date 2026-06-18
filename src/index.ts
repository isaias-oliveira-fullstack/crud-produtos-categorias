import express from "express";
import { ordersRouter } from "./routes/orders";
import { categoryRouter } from "./routes/category";
import { productRouter } from "./routes/product";
import { logger } from "./middlewares/logger";
import { errorHandler } from "./middlewares/errorHandler";

const app = express();
const port = process.env.PORT ?? 3000;

app.use(express.json({ limit: "10mb" }));
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(204);
  }
  next();
});
app.use(logger);

app.use("/api/categories", categoryRouter);
app.use("/api/category", categoryRouter);
app.use("/api/products", productRouter);
app.use("/api/orders", ordersRouter);

app.use(errorHandler);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

