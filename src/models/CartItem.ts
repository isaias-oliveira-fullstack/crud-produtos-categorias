import type { Product } from "./Product";

export interface CartItem {
  product: Product;
  quantity: number;
  itemId?: string;
  selectedColor?: string;
  selectedSize?: string;
  /** Observação de variante (cor/tamanho) quando aplicável */
  variantNote?: string;
}

