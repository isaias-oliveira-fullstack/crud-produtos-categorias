import { CategoryEntity } from "../entities/CategoryEntity";

export class CategoryResponseDto {
  id: number;
  name: string;
  slug: string;

  private constructor(id: number, name: string, slug: string) {
    this.id = id;
    this.name = name;
    this.slug = slug;
  }

  static fromEntity(entity: CategoryEntity): CategoryResponseDto {
    return new CategoryResponseDto(entity.id, entity.name, entity.slug);
  }
}

export class CategoryListDto {
  categories: CategoryResponseDto[];
  page: number;
  size: number;
  total: number;

  constructor(categories: CategoryResponseDto[], page: number, size: number, total: number) {
    this.categories = categories;
    this.page = page;
    this.size = size;
    this.total = total;
  }

  static fromEntities(entities: CategoryEntity[], page: number, size: number, total: number): CategoryListDto {
    return new CategoryListDto(entities.map(CategoryResponseDto.fromEntity), page, size, total);
  }
}
