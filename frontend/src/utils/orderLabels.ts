import type { OrderStatus } from "@shared/models/Order";

const LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "Aguardando pagamento",
  paid: "Pago",
  shipped: "Enviado",
  delivered: "Entregue",
  cancelled: "Cancelado",
};

export function orderStatusLabel(status: OrderStatus): string {
  return LABELS[status] ?? status;
}
