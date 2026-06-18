import type { Product } from "../models/Product";
import type { CartItem } from "../models/CartItem";

export class Cart {
  private items: CartItem[] = [];

  private createItemId(
    product: Product,
    selectedColor?: string,
    selectedSize?: string
  ): string {
    const parts = [String(product.id)];
    if (selectedColor) parts.push(`color:${selectedColor}`);
    if (selectedSize) parts.push(`size:${selectedSize}`);
    return parts.join("|");
  }

  private buildVariantNote(
    selectedColor?: string,
    selectedSize?: string
  ): string | undefined {
    const parts: string[] = [];
    if (selectedColor) parts.push(`Cor: ${selectedColor}`);
    if (selectedSize) parts.push(`Tamanho: ${selectedSize}`);
    return parts.length ? parts.join(" • ") : undefined;
  }

  private normalizeItem(row: CartItem): CartItem {
    const itemId =
      row.itemId || this.createItemId(row.product, row.selectedColor, row.selectedSize);
    return {
      ...row,
      itemId,
      variantNote: row.variantNote ?? this.buildVariantNote(row.selectedColor, row.selectedSize),
      product: {
        ...row.product,
        category: { ...row.product.category },
      },
    };
  }

  addItem(
    product: Product,
    quantity: number,
    selectedColor?: string,
    selectedSize?: string
  ): void {
    const itemId = this.createItemId(product, selectedColor, selectedSize);
    const existing = this.items.find((item) => item.itemId === itemId);
    const variantNote = this.buildVariantNote(selectedColor, selectedSize);

    if (existing) {
      this.items = this.items.map((item) =>
        item.itemId === itemId
          ? { ...item, quantity: item.quantity + quantity }
          : item
      );
      return;
    }

    this.items.push({
      product,
      quantity,
      itemId,
      selectedColor,
      selectedSize,
      variantNote,
    });
  }

  setQuantity(itemId: string, quantity: number): void {
    if (quantity <= 0) {
      this.removeItem(itemId);
      return;
    }

    this.items = this.items.map((item) =>
      item.itemId === itemId ? { ...item, quantity } : item
    );
  }

  getTotalItems(): number {
    return this.items.reduce(
      (total: number, item: CartItem) => total + item.quantity,
      0
    );
  }

  getFinalPrice(): number {
    return this.items.reduce(
      (total: number, item: CartItem) =>
        total + item.product.price * item.quantity,
      0
    );
  }

  getItems(): CartItem[] {
    return this.items;
  }

  loadItems(items: CartItem[]): void {
    this.items = items.map((row: CartItem) => this.normalizeItem(row));
  }

  clear(): void {
    this.items = [];
  }

  decreaseQuantity(itemId: string): void {
    const index = this.items.findIndex((item) => item.itemId === itemId);
    if (index === -1) return;
    const item = this.items[index];

    if (item.quantity <= 1) {
      this.items = this.items.filter((i) => i.itemId !== itemId);
    } else {
      this.items = this.items.map((i) =>
        i.itemId === itemId ? { ...i, quantity: i.quantity - 1 } : i
      );
    }
  }

  increaseQuantity(itemId: string): void {
    const index = this.items.findIndex((item) => item.itemId === itemId);
    if (index === -1) return;
    const item = this.items[index];

    this.items = this.items.map((i) =>
      i.itemId === itemId ? { ...i, quantity: item.quantity + 1 } : i
    );
  }

  removeItem(itemId: string): void {
    this.items = this.items.filter((item) => item.itemId !== itemId);
  }
}
