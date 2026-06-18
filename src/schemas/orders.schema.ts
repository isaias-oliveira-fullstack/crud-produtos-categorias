import { z } from "zod";

export const orderParamsSchema = z.object({
  id: z.string().min(1, { message: "O id é obrigatório" }),
});

const productRefSchema = z.object({
  id: z.coerce.number().int().positive({ message: "O product.id deve ser um inteiro positivo" }),
});

export const orderItemSchema = z.object({
  product: productRefSchema,
  quantity: z.coerce.number().int().positive({ message: "A quantidade deve ser um inteiro positivo" }),
  variantNote: z.string().optional(),
});

export const customerSnapshotSchema = z.object({
  fullName: z.string().min(3, { message: "O nome completo deve ter pelo menos 3 caracteres" }),
  email: z.string().email({ message: "E-mail inválido" }),
  phone: z.string().min(8, { message: "Telefone inválido" }),
  cpf: z.string().min(11, { message: "CPF inválido" }),
});

export const shippingAddressSchema = z.object({
  street: z.string().min(1, { message: "O logradouro é obrigatório" }),
  number: z.string().min(1, { message: "O número é obrigatório" }),
  neighborhood: z.string().min(1, { message: "O bairro é obrigatório" }),
  city: z.string().min(1, { message: "A cidade é obrigatória" }),
  state: z.string().min(1, { message: "O estado é obrigatório" }),
});

export const createOrderSchema = z.object({
  userId: z.coerce.number().int().nonnegative({ message: "O userId deve ser um número inteiro não negativo" }),
  items: z.array(orderItemSchema).min(1, { message: "Os itens são obrigatórios" }),
  total: z.coerce.number().nonnegative({ message: "O total deve ser um número não negativo" }),
  customer: customerSnapshotSchema,
  shipping: shippingAddressSchema,
  paymentMethod: z.enum(["pix", "whatsapp"], { message: "O método de pagamento deve ser pix ou whatsapp" }),
  whatsappMessageSnapshot: z.string().optional(),
  paymentLink: z.string().optional(),
  shippingAddress: z.string().optional(),
});

export const updateOrderSchema = z.object({
  status: z
    .enum(["awaiting_payment", "paid", "shipped", "delivered", "cancelled"]) // OrderStatus
    .optional(),
  paymentLink: z.string().optional(),
});

export type CreateOrderInput = z.infer<typeof createOrderSchema>;
export type UpdateOrderInput = z.infer<typeof updateOrderSchema>;
