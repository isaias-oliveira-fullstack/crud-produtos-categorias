import { BadRequestError } from "../utils/HttpError";

export interface ProductCreateProps {
  id: number;
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
}

export class ProductEntity {
  public readonly id: number;
  public name: string;
  public price: number;
  public stock: number;
  public categoryId: number;
  public description?: string;
  public thumbnail?: string;
  public mainImage?: string;
  public galleryImages?: string[];
  public colors?: string[];
  public sizes?: string[];
  public extraAttributes?: string[];

  private constructor(props: ProductCreateProps) {
    this.id = props.id;
    this.name = props.name.trim();
    this.price = props.price;
    this.stock = props.stock;
    this.categoryId = props.categoryId;
    this.description = props.description?.trim();
    this.thumbnail = props.thumbnail?.trim();
    this.mainImage = props.mainImage?.trim();
    this.galleryImages = props.galleryImages ? [...props.galleryImages] : undefined;
    this.colors = props.colors ? [...props.colors] : undefined;
    this.sizes = props.sizes ? [...props.sizes] : undefined;
    this.extraAttributes = props.extraAttributes ? [...props.extraAttributes] : undefined;
    this.validate();
  }

  static create(props: ProductCreateProps): ProductEntity {
    return new ProductEntity(props);
  }

  rename(newName: string): void {
    this.name = newName.trim();
    this.validateName();
  }

  updatePrice(price: number): void {
    this.price = price;
    this.validatePrice();
  }

  updateStock(stock: number): void {
    this.stock = stock;
    this.validateStock();
  }

  changeCategory(categoryId: number): void {
    this.categoryId = categoryId;
    this.validateCategoryId();
  }

  applyPatch(payload: Partial<Omit<ProductCreateProps, "id">>): void {
    if (payload.name !== undefined) {
      this.rename(payload.name);
    }
    if (payload.price !== undefined) {
      this.updatePrice(payload.price);
    }
    if (payload.stock !== undefined) {
      this.updateStock(payload.stock);
    }
    if (payload.categoryId !== undefined) {
      this.changeCategory(payload.categoryId);
    }
    if (payload.description !== undefined) {
      this.description = payload.description.trim();
    }
    if (payload.thumbnail !== undefined) {
      this.thumbnail = payload.thumbnail.trim();
    }
    if (payload.mainImage !== undefined) {
      this.mainImage = payload.mainImage.trim();
    }
    if (payload.galleryImages !== undefined) {
      this.galleryImages = [...payload.galleryImages];
    }
    if (payload.colors !== undefined) {
      this.colors = [...payload.colors];
    }
    if (payload.sizes !== undefined) {
      this.sizes = [...payload.sizes];
    }
    if (payload.extraAttributes !== undefined) {
      this.extraAttributes = [...payload.extraAttributes];
    }
  }

  update(payload: Partial<Omit<ProductCreateProps, "id">>): void {
    this.applyPatch(payload);
  }

  private validate(): void {
    this.validateName();
    this.validatePrice();
    this.validateStock();
    this.validateCategoryId();
  }

  private validateName(): void {
    if (!this.name || this.name.length < 3) {
      throw new BadRequestError("O nome do produto deve ter pelo menos 3 caracteres.");
    }
  }

  private validatePrice(): void {
    if (typeof this.price !== "number" || this.price <= 0) {
      throw new BadRequestError("O preço deve ser um número positivo.");
    }
  }

  private validateStock(): void {
    if (!Number.isInteger(this.stock) || this.stock < 0) {
      throw new BadRequestError("O estoque deve ser um número inteiro não negativo.");
    }
  }

  private validateCategoryId(): void {
    if (!Number.isInteger(this.categoryId) || this.categoryId <= 0) {
      throw new BadRequestError("O categoryId deve ser um inteiro positivo.");
    }
  }
}
