import type {
  Order,
  OrderCustomerSnapshot,
  OrderShippingAddress,
  OrderStatus,
} from "@shared/models/Order";
import type { PaymentMethod } from "@shared/models/Order";
import type { CartItem } from "@shared/models/CartItem";
import type { Product } from "@shared/models/Product";

const ORDERS_API = "/api/orders";

function formatShippingLine(s: OrderShippingAddress): string {
  const line1 = [s.street, s.number].filter(Boolean).join(", ").trim();
  const parts = [line1, s.neighborhood, [s.city, s.state].filter(Boolean).join("/")].filter(Boolean);
  return parts.join(" — ").trim();
}

function migrateStatus(raw: string | undefined): OrderStatus {
  if (raw === "pending" || raw === "awaiting_payment") return "awaiting_payment";
  if (raw === "paid") return "paid";
  if (raw === "shipped") return "shipped";
  if (raw === "delivered") return "delivered";
  if (raw === "cancelled") return "cancelled";
  return "awaiting_payment";
}

function normalizeShipping(o: Partial<Order>): OrderShippingAddress {
  const s = o.shipping;
  if (s && typeof s === "object") {
    return {
      street: String(s.street ?? "").trim(),
      number: String(s.number ?? "").trim(),
      neighborhood: String(s.neighborhood ?? "").trim(),
      city: String(s.city ?? "").trim(),
      state: String(s.state ?? "").trim().toUpperCase().slice(0, 2),
    };
  }
  return {
    street: "",
    number: "",
    neighborhood: "",
    city: "",
    state: "",
  };
}

function normalizeCustomer(o: Partial<Order>): OrderCustomerSnapshot {
  const c = o.customer;
  if (c && typeof c === "object") {
    return {
      fullName: String(c.fullName ?? "").trim(),
      email: String(c.email ?? "").trim().toLowerCase(),
      phone: String(c.phone ?? "").trim(),
      cpf: String(c.cpf ?? "").trim(),
    };
  }
  return { fullName: "", email: "", phone: "", cpf: "" };
}

function normalizeOrder(row: unknown): Order {
  const o = row as Partial<Order> & { status?: string };
  const status = migrateStatus(o.status);
  const paymentMethod: PaymentMethod =
    o.paymentMethod === "whatsapp" ? "whatsapp" : "pix";
  const rawItems = Array.isArray(o.items) ? (o.items as CartItem[]) : [];
  const items: CartItem[] = [];
  for (const i of rawItems) {
    if (!i?.product || typeof i.product.id !== "number") continue;
    items.push({
      quantity: Number(i.quantity ?? 0),
      variantNote: i.variantNote,
      product: {
        ...(i.product as Product),
        category: { ...i.product.category },
      },
    });
  }
  const shipping = normalizeShipping(o);
  const customer = normalizeCustomer(o);
  const legacy = String(o.shippingAddress ?? "").trim();
  const shippingAddress = legacy || formatShippingLine(shipping);
  return {
    id: String(o.id ?? ""),
    userId: Number(o.userId ?? 0),
    items,
    total: Number(o.total ?? 0),
    createdAt: String(o.createdAt ?? new Date().toISOString()),
    status,
    shippingAddress,
    customer,
    shipping,
    paymentMethod,
    paymentLink: typeof o.paymentLink === "string" ? o.paymentLink : "",
    whatsappMessageSnapshot:
      typeof o.whatsappMessageSnapshot === "string" ? o.whatsappMessageSnapshot : undefined,
  };
}

async function fetchOrders(userId?: number): Promise<Order[]> {
  const url = userId ? `${ORDERS_API}?userId=${encodeURIComponent(userId)}` : ORDERS_API;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error("Falha ao carregar pedidos.");
  }
  const data = (await res.json()) as { orders: unknown[] };
  if (!Array.isArray(data.orders)) {
    throw new Error("Resposta de pedidos inválida.");
  }
  return data.orders.map(normalizeOrder).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function fetchOrderById(id: string): Promise<Order | null> {
  const res = await fetch(`${ORDERS_API}/${encodeURIComponent(id)}`);
  if (res.status === 404) {
    return null;
  }
  if (!res.ok) {
    throw new Error("Falha ao carregar pedido.");
  }
  const data = await res.json();
  return normalizeOrder(data);
}

export const orderService = {
  async listForUser(userId: number): Promise<Order[]> {
    return fetchOrders(userId);
  },

  async listAll(): Promise<Order[]> {
    return fetchOrders();
  },

  async getById(id: string): Promise<Order | null> {
    return fetchOrderById(id);
  },

  async createFromCart(payload: {
    userId: number;
    items: CartItem[];
    total: number;
    customer: OrderCustomerSnapshot;
    shipping: OrderShippingAddress;
    paymentMethod: PaymentMethod;
    whatsappMessageSnapshot?: string;
  }): Promise<Order> {
    const response = await fetch(ORDERS_API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        userId: payload.userId,
        items: payload.items,
        total: payload.total,
        customer: {
          fullName: payload.customer.fullName.trim(),
          email: payload.customer.email.trim().toLowerCase(),
          phone: payload.customer.phone.trim(),
          cpf: payload.customer.cpf.trim(),
        },
        shipping: {
          street: payload.shipping.street.trim(),
          number: payload.shipping.number.trim(),
          neighborhood: payload.shipping.neighborhood.trim(),
          city: payload.shipping.city.trim(),
          state: payload.shipping.state.trim().toUpperCase().slice(0, 2),
        },
        paymentMethod: payload.paymentMethod,
        whatsappMessageSnapshot: payload.whatsappMessageSnapshot,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Falha ao criar pedido: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    return normalizeOrder(data);
  },

  async summary(): Promise<{ orders: number; revenue: number; itemsSold: number }> {
    const orders = await fetchOrders();
    return {
      orders: orders.length,
      revenue: orders.reduce((sum, o) => sum + o.total, 0),
      itemsSold: orders.reduce((sum, o) => sum + o.items.reduce((s, i) => s + i.quantity, 0), 0),
    };
  },

  async updateStatus(id: string, status: OrderStatus): Promise<{ ok: true } | { ok: false; error: string }> {
    const response = await fetch(`${ORDERS_API}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { ok: false, error: "Pedido não encontrado." };
      }
      return { ok: false, error: "Falha ao atualizar status do pedido." };
    }

    return { ok: true };
  },

  async updatePaymentLink(
    id: string,
    paymentLink: string
  ): Promise<{ ok: true } | { ok: false; error: string }> {
    const response = await fetch(`${ORDERS_API}/${encodeURIComponent(id)}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ paymentLink: paymentLink.trim() }),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { ok: false, error: "Pedido não encontrado." };
      }
      return { ok: false, error: "Falha ao atualizar o link de pagamento." };
    }

    return { ok: true };
  },

  async remove(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
    const response = await fetch(`${ORDERS_API}/${encodeURIComponent(id)}`, {
      method: "DELETE",
    });

    if (response.status === 204) {
      return { ok: true };
    }
    if (response.status === 404) {
      return { ok: false, error: "Pedido não encontrado." };
    }
    return { ok: false, error: "Falha ao remover pedido." };
  },
};
