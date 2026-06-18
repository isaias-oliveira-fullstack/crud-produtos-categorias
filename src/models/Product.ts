import type { Category } from "./Category";

export interface Product {
  id: number;
  name: string;
  price: number;
  category: Category;
  thumbnail?: string;
  description?: string;
  brand?: string;
  stock?: number;
  /** Slug para rotas públicas de produto */
  slug?: string;
  /** Produtos criados localmente (admin) não vêm da API */
  localOnly?: boolean;
  /** ID da categoria cadastrada (admin) */
  categoryId?: number;
  colors?: string[];
  sizes?: string[];
  /** Outras características (ex.: "Material: Algodão") */
  extraAttributes?: string[];
  /** Imagem principal (base64 data URL ou URL) */
  mainImage?: string;
  /** Galeria (base64 ou URLs) */
  galleryImages?: string[];
}

