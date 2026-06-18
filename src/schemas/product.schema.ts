import { z } from "zod";

export const ProductCreateSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }),
  price: z.number().positive({ message: "O preço deve ser um número positivo" }),
  stock: z.number().int().nonnegative({ message: "O estoque deve ser um número inteiro não negativo" }),
  categoryId: z.number().int().positive({ message: "O categoryId deve ser um inteiro positivo" }),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  mainImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  extraAttributes: z.array(z.string()).optional(),
});

export const ProductUpdateSchema = z.object({
  name: z.string().min(3, { message: "O nome deve ter pelo menos 3 caracteres" }).optional(),
  price: z.number().positive({ message: "O preço deve ser um número positivo" }).optional(),
  stock: z.number().int().nonnegative({ message: "O estoque deve ser um número inteiro não negativo" }).optional(),
  categoryId: z.number().int().positive({ message: "O categoryId deve ser um inteiro positivo" }).optional(),
  description: z.string().optional(),
  thumbnail: z.string().optional(),
  mainImage: z.string().optional(),
  galleryImages: z.array(z.string()).optional(),
  colors: z.array(z.string()).optional(),
  sizes: z.array(z.string()).optional(),
  extraAttributes: z.array(z.string()).optional(),
});

export const ProductParamsSchema = z.object({
  id: z.coerce.number().int().positive({ message: "ID inválido" }),
});

export const ProductSlugParamsSchema = z.object({
  slug: z.string().min(1, { message: "Slug inválido" }),
});

const numericQueryParam = (defaultValue: number, name: string) =>
  z
    .string()
    .optional()
    .transform((value) => (value ? Number(value) : defaultValue))
    .refine((value) => Number.isInteger(value) && value >= 0, {
      message: `O ${name} deve ser um inteiro não negativo`,
    });

export const ProductQuerySchema = z.object({
  page: numericQueryParam(1, "page"),
  size: numericQueryParam(10, "size"),
  skip: numericQueryParam(0, "skip"),
  limit: numericQueryParam(10, "limit"),
  category: z.string().optional(),
});
