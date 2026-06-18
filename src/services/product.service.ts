import { ProductRepository } from "../repositories/product.repository";
import { CategoryRepository } from "../repositories/category.repository";
import { ProductEntity } from "../entities/ProductEntity";
import { NotFoundError } from "../utils/HttpError";

function slugifyCategory(name: string): string {
  return name
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

export class ProductService {
  constructor(
    private readonly repository: ProductRepository,
    private readonly categoryRepository: CategoryRepository
  ) {}

  getAll(page: number, size: number, categorySlug?: string) {
    if (!categorySlug) {
      return this.repository.getAllProducts(page, size);
    }

    const all = this.repository.getAllProducts(1, Number.MAX_SAFE_INTEGER).products;
    const filtered = all.filter((product) => {
      const category = this.categoryRepository.getCategoryById(product.categoryId);
      return category ? slugifyCategory(category.name) === categorySlug : false;
    });
    const offset = (page - 1) * size;
    return {
      products: filtered.slice(offset, offset + size),
      total: filtered.length,
    };
  }

  getById(id: number): ProductEntity {
    const product = this.repository.getProductById(id);
    if (!product) {
      throw new NotFoundError("Produto não encontrado.");
    }
    return product;
  }

  getBySlug(slug: string): ProductEntity {
    const normalizedSlug = slug
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .toLowerCase()
      .replace(/^-+|-+$/g, "");

    const products = this.repository.getAllProducts(1, Number.MAX_SAFE_INTEGER).products;
    const product = products.find((product) => {
      const category = this.categoryRepository.getCategoryById(product.categoryId);
      const slugifiedName = product.name
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .replace(/\s+/g, "-")
        .replace(/[^\w-]+/g, "")
        .toLowerCase()
        .replace(/^-+|-+$/g, "");
      return slugifiedName === normalizedSlug;
    });

    if (!product) {
      throw new NotFoundError("Produto não encontrado.");
    }
    return product;
  }

  create(payload: {
    name: string;
    price: number;
    stock: number;
    categoryId: number;
    description?: string;
    thumbnail?: string;
    mainImage?: string;
    galleryImages?: string[];
    colors?: string[];
    sizes?: string[];
    extraAttributes?: string[];
  }): ProductEntity {
    const category = this.categoryRepository.getCategoryById(payload.categoryId);
    if (!category) {
      throw new NotFoundError("Categoria não encontrada.");
    }
    const product = ProductEntity.create({
      id: this.repository.generateId(),
      name: payload.name,
      price: payload.price,
      stock: payload.stock,
      categoryId: payload.categoryId,
      description: payload.description,
      thumbnail: payload.thumbnail,
      mainImage: payload.mainImage,
      galleryImages: payload.galleryImages,
      colors: payload.colors,
      sizes: payload.sizes,
      extraAttributes: payload.extraAttributes,
    });
    return this.repository.createProduct(product);
  }

  getByCategorySlug(slug: string, page: number, size: number) {
    const categories = this.categoryRepository.getAllCategories(1, Number.MAX_SAFE_INTEGER).categories;
    const matchingCategory = categories.find((category) => slugifyCategory(category.name) === slug);
    if (!matchingCategory) {
      throw new NotFoundError("Categoria não encontrada.");
    }
    const allProducts = this.repository.getAllProducts(1, Number.MAX_SAFE_INTEGER).products;
    const filtered = allProducts.filter((product) => product.categoryId === matchingCategory.id);
    const offset = (page - 1) * size;
    return {
      products: filtered.slice(offset, offset + size),
      total: filtered.length,
    };
  }

  update(
    id: number,
    payload: {
      name?: string;
      price?: number;
      stock?: number;
      categoryId?: number;
      description?: string;
      thumbnail?: string;
      mainImage?: string;
      galleryImages?: string[];
      colors?: string[];
      sizes?: string[];
      extraAttributes?: string[];
    }
  ): ProductEntity {
    const product = this.repository.getProductById(id);
    if (!product) {
      throw new NotFoundError("Produto não encontrado.");
    }
    if (payload.categoryId !== undefined && payload.categoryId !== product.categoryId) {
      const category = this.categoryRepository.getCategoryById(payload.categoryId);
      if (!category) {
        throw new NotFoundError("Categoria não encontrada.");
      }
    }
    product.update(payload);
    return this.repository.updateProduct(product);
  }

  delete(id: number): void {
    const product = this.repository.getProductById(id);
    if (!product) {
      throw new NotFoundError("Produto não encontrado.");
    }
    this.repository.deleteProduct(id);
  }
}
