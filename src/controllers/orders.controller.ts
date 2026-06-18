import type { Request, Response } from "express";
import type { Order, OrderCustomerSnapshot, OrderShippingAddress, OrderStatus, PaymentMethod } from "../models/Order";

export interface CreateOrderBody {
  userId: number;
  items: Order["items"];
  total: number;
  customer: OrderCustomerSnapshot;
  shipping: OrderShippingAddress;
  paymentMethod: PaymentMethod;
  whatsappMessageSnapshot?: string;
  paymentLink?: string;
  shippingAddress?: string;
}

export interface UpdateOrderBody {
  status?: OrderStatus;
  paymentLink?: string;
}

const orders: Order[] = [];

function createOrderId(): string {
  return `ord_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

function formatShippingAddress(shipping: OrderShippingAddress): string {
  const line1 = [shipping.street, shipping.number].filter(Boolean).join(", ").trim();
  const location = [
    shipping.neighborhood,
    [shipping.city, shipping.state].filter(Boolean).join("/")
  ]
    .filter(Boolean)
    .join(" — ")
    .trim();
  return [line1, location].filter(Boolean).join(" — ").trim();
}

function isValidStatus(value: unknown): value is OrderStatus {
  return (
    value === "awaiting_payment" ||
    value === "paid" ||
    value === "shipped" ||
    value === "delivered" ||
    value === "cancelled"
  );
}

export const ordersController = {
  list: (req: Request, res: Response) => {
    const filterUserId = req.query.userId ? Number(req.query.userId) : undefined;
    const filtered = typeof filterUserId === "number" && !Number.isNaN(filterUserId)
      ? orders.filter((order) => order.userId === filterUserId)
      : orders;

    return res.json({ orders: filtered, total: filtered.length });
  },

  getById: (req: Request, res: Response) => {
    const orderId = req.params.id;
    const order = orders.find((item) => item.id === orderId);
    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }
    return res.json(order);
  },

  create: (req: Request, res: Response) => {
    const body = req.body as CreateOrderBody;

    if (!Array.isArray(body.items) || body.items.length === 0) {
      return res.status(400).json({ message: "Itens do pedido são obrigatórios." });
    }
    if (!body.customer || !body.customer.fullName) {
      return res.status(400).json({ message: "Dados do cliente são obrigatórios." });
    }
    if (!body.shipping) {
      return res.status(400).json({ message: "Endereço de entrega é obrigatório." });
    }
    if (body.paymentMethod !== "pix" && body.paymentMethod !== "whatsapp") {
      return res.status(400).json({ message: "Método de pagamento inválido." });
    }

    const order: Order = {
      id: createOrderId(),
      userId: Number(body.userId),
      items: body.items,
      total: Number(body.total),
      createdAt: new Date().toISOString(),
      status: "awaiting_payment",
      shippingAddress: body.shippingAddress || formatShippingAddress(body.shipping),
      customer: body.customer,
      shipping: body.shipping,
      paymentMethod: body.paymentMethod,
      paymentLink: body.paymentLink ? String(body.paymentLink).trim() : "",
      whatsappMessageSnapshot: body.whatsappMessageSnapshot,
    };

    orders.push(order);
    return res.status(201).json(order);
  },

  update: (req: Request, res: Response) => {
    const orderId = req.params.id;
    const body = req.body as UpdateOrderBody;
    const order = orders.find((item) => item.id === orderId);

    if (!order) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }

    if (body.status === undefined && body.paymentLink === undefined) {
      return res.status(400).json({ message: "Status ou paymentLink são obrigatórios." });
    }

    if (body.status !== undefined) {
      if (!isValidStatus(body.status)) {
        return res.status(400).json({ message: "Status inválido." });
      }
      order.status = body.status;
    }

    if (body.paymentLink !== undefined) {
      order.paymentLink = String(body.paymentLink).trim();
    }

    return res.json(order);
  },

  delete: (req: Request, res: Response) => {
    const orderId = req.params.id;
    const index = orders.findIndex((item) => item.id === orderId);
    if (index === -1) {
      return res.status(404).json({ message: "Pedido não encontrado." });
    }
    orders.splice(index, 1);
    return res.sendStatus(204);
  },
};
