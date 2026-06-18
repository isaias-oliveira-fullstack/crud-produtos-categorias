import type { CartItem } from "@shared/models/CartItem";
import type { OrderShippingAddress } from "@shared/models/Order";
import { digitsOnly } from "./brValidation";
import { formatBRL } from "./format";

export { digitsOnly };

function formatAddressBlock(addr: OrderShippingAddress | string): string {
  if (typeof addr === "string") return addr.trim();
  const line1 = [addr.street, addr.number].filter(Boolean).join(", ").trim();
  const line2 = [addr.neighborhood, [addr.city, addr.state].filter(Boolean).join("/")]
    .filter(Boolean)
    .join(" — ");
  return [line1, line2].filter(Boolean).join("\n");
}

export function buildCheckoutMessage(opts: {
  items: CartItem[];
  total: number;
  customerName: string;
  customerPhone: string;
  shipping: OrderShippingAddress | string;
}): string {
  const lines = opts.items.map((i) => {
    const variantSuffix = i.variantNote ? ` (${i.variantNote})` : "";
    return `• ${i.product.name}${variantSuffix} × ${i.quantity} — ${formatBRL(
      i.product.price * i.quantity
    )}`;
  });
  return [
    "Novo pedido — loja (simulação)",
    "",
    `Cliente: ${opts.customerName.trim()}`,
    `Telefone/WhatsApp: ${opts.customerPhone.trim()}`,
    "",
    ...lines,
    "",
    `Total: ${formatBRL(opts.total)}`,
    "",
    "Endereço de entrega:",
    formatAddressBlock(opts.shipping),
  ].join("\n");
}

export function buildPaymentLinkMessage(
  orderId: string,
  total: number,
  paymentLink: string,
  customerName?: string
): string {
  const greet = customerName?.trim() ? `Olá, ${customerName.trim()}!` : "Olá!";
  return [
    greet,
    "",
    `Pedido ${orderId}`,
    `Total: ${formatBRL(total)}`,
    "",
    "Link de pagamento:",
    paymentLink,
  ].join("\n");
}

export function waMeUrl(phoneDigits: string, message: string): string {
  const n = digitsOnly(phoneDigits);
  return `https://wa.me/${n}?text=${encodeURIComponent(message)}`;
}
