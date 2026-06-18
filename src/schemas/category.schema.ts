import { z } from "zod";

export const CategoryCreateSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  slug: z.string().min(1, { message: "O slug deve conter pelo menos 1 caractere" }).optional(),
});

export const CategoryUpdateSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  slug: z.string().min(1, { message: "O slug deve conter pelo menos 1 caractere" }).optional(),
});

export const CategoryParamsSchema = z.object({
  id: z.coerce.number().int().positive({ message: "ID inválido" }),
});

export const CategoryQuerySchema = z.object({
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
