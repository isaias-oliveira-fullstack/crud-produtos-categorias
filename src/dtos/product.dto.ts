import { ProductEntity } from "../entities/ProductEntity";

export type ProductCategoryDto = {
  id: number;
  title: string;
};

export class ProductResponseDto {
  id: number;
  name: string;
  price: number;
  stock: number;
  categoryId: number;
  category: ProductCategoryDto;
  slug?: string;
  description?: string;
  thumbnail?: string;
  mainImage?: string;
  galleryImages?: string[];
  colors?: string[];
  sizes?: string[];
  extraAttributes?: string[];

  private constructor(
    id: number,
    name: string,
    price: number,
    stock: number,
    categoryId: number,
    category: ProductCategoryDto,
    slug?: string,
    description?: string,
    thumbnail?: string,
    mainImage?: string,
    galleryImages?: string[],
    colors?: string[],
    sizes?: string[],
    extraAttributes?: string[]
  ) {
    this.id = id;
    this.name = name;
    this.price = price;
    this.stock = stock;
    this.categoryId = categoryId;
    this.category = category;
    this.slug = slug;
    this.description = description;
    this.thumbnail = thumbnail;
    this.mainImage = mainImage;
    this.galleryImages = galleryImages;
    this.colors = colors;
    this.sizes = sizes;
    this.extraAttributes = extraAttributes;
  }

  static fromEntity(entity: ProductEntity, category: ProductCategoryDto, slug?: string): ProductResponseDto {
    return new ProductResponseDto(
      entity.id,
      entity.name,
      entity.price,
      entity.stock,
      entity.categoryId,
      category,
      slug,
      entity.description,
      entity.thumbnail,
      entity.mainImage,
      entity.galleryImages,
      entity.colors,
      entity.sizes,
      entity.extraAttributes
    );
  }
}

export class ProductListDto {
  products: ProductResponseDto[];
  page: number;
  size: number;
  total: number;

  constructor(products: ProductResponseDto[], page: number, size: number, total: number) {
    this.products = products;
    this.page = page;
    this.size = size;
    this.total = total;
  }

  static fromEntities(entities: ProductResponseDto[], page: number, size: number, total: number): ProductListDto {
    return new ProductListDto(entities, page, size, total);
  }
}
