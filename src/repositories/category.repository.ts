import { CategoryEntity } from "../entities/CategoryEntity";

export class CategoryRepository {
  private items = new Map<number, CategoryEntity>();
  private currentId = 1;

  createCategory(category: CategoryEntity): CategoryEntity {
    this.items.set(category.id, category);
    return category;
  }

  generateId(): number {
    return this.currentId++;
  }

  getAllCategories(page: number, size: number): { categories: CategoryEntity[]; total: number } {
    const all = Array.from(this.items.values()).sort((a, b) => a.id - b.id);
    const offset = (page - 1) * size;
    const paged = all.slice(offset, offset + size);
    return { categories: paged, total: all.length };
  }

  getCategoryById(id: number): CategoryEntity | null {
    return this.items.get(id) ?? null;
  }

  updateCategory(category: CategoryEntity): CategoryEntity {
    this.items.set(category.id, category);
    return category;
  }

  deleteCategory(id: number): void {
    this.items.delete(id);
  }
}
