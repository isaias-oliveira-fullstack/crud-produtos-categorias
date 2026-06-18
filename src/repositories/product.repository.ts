import { ProductEntity } from "../entities/ProductEntity";

export class ProductRepository {
  private items = new Map<number, ProductEntity>();
  private currentId = 1;

  createProduct(product: ProductEntity): ProductEntity {
    this.items.set(product.id, product);
    return product;
  }

  generateId(): number {
    return this.currentId++;
  }

  getAllProducts(page: number, size: number): { products: ProductEntity[]; total: number } {
    const all = Array.from(this.items.values()).sort((a, b) => a.id - b.id);
    const offset = (page - 1) * size;
    return {
      products: all.slice(offset, offset + size),
      total: all.length,
    };
  }

  getProductById(id: number): ProductEntity | null {
    return this.items.get(id) ?? null;
  }

  updateProduct(product: ProductEntity): ProductEntity {
    this.items.set(product.id, product);
    return product;
  }

  deleteProduct(id: number): void {
    this.items.delete(id);
  }
}
