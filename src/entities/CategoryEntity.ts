import { BadRequestError } from "../utils/HttpError";

export class CategoryEntity {
  public readonly id: number;
  public name: string;
  public slug: string;

  private constructor(id: number, name: string, slug: string) {
    this.id = id;
    this.name = name.trim();
    this.slug = slug.trim();
    this.validate();
  }

  static create(id: number, name: string, slug?: string): CategoryEntity {
    const normalizedSlug = slug?.trim()
      ? CategoryEntity.normalizeSlug(slug.trim())
      : CategoryEntity.generateSlug(name);
    return new CategoryEntity(id, name, normalizedSlug);
  }

  rename(newName: string, slug?: string): void {
    this.name = newName.trim();
    this.slug = slug?.trim()
      ? CategoryEntity.normalizeSlug(slug.trim())
      : CategoryEntity.generateSlug(newName);
    this.validate();
  }

  private static generateSlug(value: string): string {
    const normalized = value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .toLowerCase()
      .replace(/^-+|-+$/g, "");

    if (!normalized) {
      throw new BadRequestError("O slug da categoria é inválido.");
    }

    return normalized;
  }

  private static normalizeSlug(value: string): string {
    return value
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/\s+/g, "-")
      .replace(/[^\w-]+/g, "")
      .toLowerCase()
      .replace(/^-+|-+$/g, "");
  }

  private validate(): void {
    if (!this.name || this.name.length < 3) {
      throw new BadRequestError("O nome da categoria deve ter pelo menos 3 caracteres.");
    }

    if (!this.slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(this.slug)) {
      throw new BadRequestError("O slug da categoria deve conter apenas letras, números e hífens.");
    }
  }
}
