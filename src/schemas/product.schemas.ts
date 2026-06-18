import { z } from "zod";

export const ProductCreateSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  price: z.number().positive({ message: "O preço deve ser um número positivo" }),
  stock: z.number().int().nonnegative({ message: "O estoque deve ser um número inteiro não negativo" }),
  categoryId: z.number().int().positive({ message: "O categoryId deve ser um inteiro positivo" }),
});

export const ProductUpdateSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }).optional(),
  price: z.number().positive({ message: "O preço deve ser um número positivo" }).optional(),
  stock: z.number().int().nonnegative({ message: "O estoque deve ser um número inteiro não negativo" }).optional(),
  categoryId: z.number().int().positive({ message: "O categoryId deve ser um inteiro positivo" }).optional(),
});

export const ProductParamsSchema = z.object({
  id: z.coerce.number().int().positive({ message: "ID inválido" }),
});

export const ProductQuerySchema = z.object({
  page: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : 1))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "O page deve ser um inteiro positivo",
    }),
  size: z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : 10))
    .refine((value) => Number.isInteger(value) && value > 0, {
      message: "O size deve ser um inteiro positivo",
    }),
});
