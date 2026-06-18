import type { Product } from "@shared/models/Product";
import type { CartItem } from "@shared/models/CartItem";
import { Cart } from "@shared/classes/Cart";
import { STORAGE } from "./storageKeys";

const cart = new Cart();
const listeners = new Set<() => void>();

function persist(): void {
  try {
    const items = cart.getItems();
    localStorage.setItem(STORAGE.CART, JSON.stringify(items));
  } catch {
    /* ignore */
  }
}

function loadFromStorage(): void {
  try {
    const raw = localStorage.getItem(STORAGE.CART);
    if (!raw) return;
    const parsed = JSON.parse(raw) as CartItem[];
    if (!Array.isArray(parsed)) return;
    cart.loadItems(parsed);
  } catch {
    /* ignore */
  }
}

function notify(): void {
  persist();
  listeners.forEach((fn) => fn());
}

loadFromStorage();

export const cartService = {
  subscribe(fn: () => void): () => void {
    listeners.add(fn);
    return () => listeners.delete(fn);
  },

  getCart(): Cart {
    return cart;
  },

  getItems(): CartItem[] {
    return cart.getItems();
  },

  getTotalItems(): number {
    return cart.getTotalItems();
  },

  getFinalPrice(): number {
    return cart.getFinalPrice();
  },

  addItem(product: Product, quantity: number, selectedColor?: string, selectedSize?: string): void {
    cart.addItem(product, quantity, selectedColor, selectedSize);
    notify();
  },

  setQuantity(itemId: string, quantity: number): void {
    cart.setQuantity(itemId, quantity);
    notify();
  },

  decreaseQuantity(itemId: string): void {
    cart.decreaseQuantity(itemId);
    notify();
  },

  removeItem(itemId: string): void {
    cart.removeItem(itemId);
    notify();
  },

  clear(): void {
    cart.clear();
    notify();
  },

  isEmpty(): boolean {
    return cart.getItems().length === 0;
  },
};
