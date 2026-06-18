import { CategoryRepository } from "../repositories/category.repository";
import { CategoryEntity } from "../entities/CategoryEntity";
import { NotFoundError } from "../utils/HttpError";

export class CategoryService {
  constructor(private readonly repository: CategoryRepository) {}

  getAll(page: number, size: number) {
    return this.repository.getAllCategories(page, size);
  }

  getById(id: number): CategoryEntity {
    const category = this.repository.getCategoryById(id);
    if (!category) {
      throw new NotFoundError("Categoria não encontrada.");
    }
    return category;
  }

  create(name: string, slug?: string): CategoryEntity {
    const category = CategoryEntity.create(this.repository.generateId(), name, slug);
    return this.repository.createCategory(category);
  }

  update(id: number, name: string, slug?: string): CategoryEntity {
    const category = this.repository.getCategoryById(id);
    if (!category) {
      throw new NotFoundError("Categoria não encontrada.");
    }
    category.rename(name, slug);
    return this.repository.updateCategory(category);
  }

  delete(id: number): void {
    const category = this.repository.getCategoryById(id);
    if (!category) {
      throw new NotFoundError("Categoria não encontrada.");
    }
    this.repository.deleteCategory(id);
  }
}
