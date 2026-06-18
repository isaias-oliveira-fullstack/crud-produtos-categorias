import type { CartItem } from "./CartItem";

export type OrderStatus =
  | "awaiting_payment"
  | "paid"
  | "shipped"
  | "delivered"
  | "cancelled";

/** Legado */
export type LegacyOrderStatus = "pending";

export type PaymentMethod = "pix" | "whatsapp";

/** Dados do cliente no momento do pedido (snapshot) */
export interface OrderCustomerSnapshot {
  fullName: string;
  email: string;
  phone: string;
  cpf: string;
}

/** Endereço estruturado de entrega */
export interface OrderShippingAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
}

export interface Order {
  id: string;
  userId: number;
  items: CartItem[];
  total: number;
  createdAt: string;
  status: OrderStatus;
  /** Texto único para exibição / legado (gerado a partir de `shipping` quando possível) */
  shippingAddress: string;
  /** Dados pessoais e endereço completos */
  customer: OrderCustomerSnapshot;
  shipping: OrderShippingAddress;
  paymentMethod: PaymentMethod;
  /** Link de pagamento (ex.: gateway). Obrigatório para envio pelo admin via WhatsApp. */
  paymentLink: string;
  /** Snapshot da mensagem enviada ao WhatsApp no checkout (opcional) */
  whatsappMessageSnapshot?: string;
}
