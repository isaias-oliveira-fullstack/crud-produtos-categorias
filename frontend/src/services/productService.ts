import type { Category } from "@shared/models/Category";
import type { Product } from "@shared/models/Product";
import { idFromString } from "@shared/utils/hashId";
import { categoryService } from "./categoryService";
import { STORAGE } from "./storageKeys";

const API = "/api/products";

interface DummyProduct {
  id: number;
  slug?: string;
  title?: string;
  name?: string;
  description?: string;
  price: number;
  thumbnail?: string;
  mainImage?: string;
  galleryImages?: string[];
  brand?: string;
  stock?: number;
  colors?: string[];
  sizes?: string[];
  extraAttributes?: string[];
  category: string | { id: number; title: string };
}

interface DummyListResponse {
  products: DummyProduct[];
  total: number;
  skip: number;
  limit: number;
}

function slugifyValue(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

function mapDummy(p: DummyProduct): Product {
  const category: Category =
    typeof p.category === "string"
      ? { id: idFromString(p.category), title: p.category }
      : p.category;

  const name = (p.title ?? p.name ?? "").toString();

  return {
    id: p.id,
    slug: p.slug ?? slugifyValue(name),
    name,
    price: p.price,
    category,
    categoryId: typeof p.category === "object" ? p.category.id : idFromString(p.category),
    thumbnail: p.thumbnail,
    mainImage: p.mainImage,
    galleryImages: p.galleryImages,
    description: p.description,
    brand: p.brand,
    stock: p.stock,
    colors: p.colors,
    sizes: p.sizes,
    extraAttributes: p.extraAttributes,
  };
}

function isQuotaExceededError(error: unknown): boolean {
  const message = String(error);
  return (
    error instanceof DOMException &&
    (error.name === "QuotaExceededError" || error.name === "NS_ERROR_DOM_QUOTA_REACHED")
  ) || /QuotaExceededError|NS_ERROR_DOM_QUOTA_REACHED/i.test(message);
}

function readLocalProducts(): Product[] {
  try {
    const raw = localStorage.getItem(STORAGE.LOCAL_PRODUCTS);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as Product[];
    if (!Array.isArray(parsed)) return [];
    return parsed.map((product) => ({
      ...product,
      localOnly: true,
      slug: product.slug || slugifyValue(product.name),
    }));
  } catch {
    return [];
  }
}

function writeLocalProducts(products: Product[]): Product[] {
  const normalized = products.map((product) => ({ ...product, localOnly: true }));

  try {
    localStorage.setItem(STORAGE.LOCAL_PRODUCTS, JSON.stringify(normalized));
    return normalized;
  } catch (error) {
    if (!isQuotaExceededError(error)) throw error;

    const withoutGallery = normalized.map((product) => ({
      ...product,
      galleryImages: undefined,
    }));

    try {
      localStorage.setItem(STORAGE.LOCAL_PRODUCTS, JSON.stringify(withoutGallery));
      return withoutGallery;
    } catch (nextError) {
      if (!isQuotaExceededError(nextError)) throw nextError;

      const withoutImages = withoutGallery.map((product) => ({
        ...product,
        mainImage: undefined,
        thumbnail: undefined,
      }));

      localStorage.setItem(STORAGE.LOCAL_PRODUCTS, JSON.stringify(withoutImages));
      return withoutImages;
    }
  }
}

function nextLocalId(): number {
  const raw = localStorage.getItem(STORAGE.LOCAL_PRODUCT_SEQ);
  const current = raw ? Number(raw) : 1_000_000;
  const next = current + 1;
  localStorage.setItem(STORAGE.LOCAL_PRODUCT_SEQ, String(next));
  return next;
}

function matchesCategoryFilter(
  product: Product,
  categorySlug: string,
): boolean {
  const slug = categorySlug.toLowerCase();
  const localCat = categoryService.list().find((c) => c.slug === categorySlug);
  if (localCat && product.categoryId) {
    return product.categoryId === localCat.id;
  }
  return product.category.title.toLowerCase() === slug;
}

export const productService = {
  async fetchPage(params?: {
    limit?: number;
    skip?: number;
    categorySlug?: string;
  }): Promise<{
    products: Product[];
    total: number;
  }> {
    const limit = params?.limit ?? 30;
    const skip = params?.skip ?? 0;

    let url = "";

    if (params?.categorySlug) {
      url = `${API}/category/${encodeURIComponent(params.categorySlug)}?limit=${limit}&skip=${skip}`;
    } else {
      url = `${API}?limit=${limit}&skip=${skip}`;
    }
    const res = await fetch(url);
    if (!res.ok) throw new Error("Falha ao carregar produtos.");
    const data = (await res.json()) as DummyListResponse;
    return {
      products: data.products.map(mapDummy),
      total: data.total,
    };
  },

  async fetchByCategory(category: string): Promise<Product[]> {
    const slug = encodeURIComponent(category);
    const res = await fetch(`${API}?category=${slug}`);
    if (!res.ok) throw new Error("Categoria não encontrada.");
    const data = (await res.json()) as DummyListResponse;
    return data.products.map(mapDummy);
  },

  async fetchCategories(): Promise<{ slug: string; name: string }[]> {
    try {
      const remote = await categoryService.fetchAll();
      return remote.map((category) => ({ slug: category.slug, name: category.name }));
    } catch {
      return categoryService.list().map((category) => ({ slug: category.slug, name: category.name }));
    }
  },

  async getById(id: number): Promise<Product | null> {
    const local = readLocalProducts().find((p) => p.id === id);
    if (local) return local;
    const res = await fetch(`${API}/${id}`);
    if (!res.ok) return null;
    const p = (await res.json()) as DummyProduct;
    return mapDummy(p);
  },

  async getBySlug(slug: string): Promise<Product | null> {
    const local = readLocalProducts().find((p) => p.slug === slug);
    if (local) return local;
    if (/^\d+$/.test(slug)) {
      return this.getById(Number(slug));
    }
    const res = await fetch(`${API}/slug/${encodeURIComponent(slug)}`);
    if (!res.ok) return null;
    const p = (await res.json()) as DummyProduct;
    return mapDummy(p);
  },

  async createRemote(payload: {
    name: string;
    price: number;
    categoryId: number;
    stock: number;
    description?: string;
    thumbnail?: string;
    mainImage?: string;
    galleryImages?: string[];
    colors?: string[];
    sizes?: string[];
    extraAttributes?: string[];
  }): Promise<Product> {
    const response = await fetch(API, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer admin-token",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message ?? "Falha ao criar produto.");
    }
    const p = (await response.json()) as DummyProduct;
    return mapDummy(p);
  },

  async updateRemote(
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
  ): Promise<Product> {
    const response = await fetch(`${API}/${encodeURIComponent(id)}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer admin-token",
      },
      body: JSON.stringify(payload),
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message ?? "Falha ao atualizar produto.");
    }
    const p = (await response.json()) as DummyProduct;
    return mapDummy(p);
  },

  async deleteRemote(id: number): Promise<void> {
    const response = await fetch(`${API}/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: {
        Authorization: "Bearer admin-token",
      },
    });
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error?.message ?? "Falha ao remover produto.");
    }
  },

  getMergedCatalog(apiProducts: Product[]): Product[] {
    const local = readLocalProducts();
    const map = new Map<number, Product>();
    apiProducts.forEach((p) => map.set(p.id, p));
    local.forEach((p) => map.set(p.id, p));
    return Array.from(map.values());
  },

  mergePage(
    apiProducts: Product[],
    categorySlug: string | "",
    includeLocalExtras: boolean,
  ): Product[] {
    const map = new Map<number, Product>();
    apiProducts.forEach((p) => map.set(p.id, p));
    if (includeLocalExtras) {
      readLocalProducts().forEach((p) => {
        if (categorySlug && !matchesCategoryFilter(p, categorySlug)) return;
        if (!map.has(p.id)) map.set(p.id, p);
      });
    }
    return Array.from(map.values());
  },

  listLocal(): Product[] {
    return readLocalProducts();
  },

  createLocal(payload: {
    name: string;
    price: number;
    categoryId: number;
    description?: string;
    stock?: number;
    colors?: string[];
    sizes?: string[];
    extraAttributes?: string[];
    mainImage?: string;
    galleryImages?: string[];
  }): Product {
    const cat = categoryService.getById(payload.categoryId);
    if (!cat) {
      throw new Error("Categoria inválida.");
    }
    const category: Category = {
      id: cat.id,
      title: cat.name,
    };
    const thumb =
      payload.mainImage || (payload.galleryImages && payload.galleryImages[0]);
    const normalizedName = payload.name.trim();
    const product: Product = {
      id: nextLocalId(),
      slug: slugifyValue(normalizedName),
      name: normalizedName,
      price: payload.price,
      category,
      categoryId: cat.id,
      description: payload.description?.trim(),
      stock: payload.stock ?? 0,
      localOnly: true,
      colors: payload.colors,
      sizes: payload.sizes,
      extraAttributes: payload.extraAttributes,
      mainImage: payload.mainImage,
      galleryImages: payload.galleryImages,
      thumbnail: thumb,
    };
    const all = readLocalProducts();
    all.push(product);
    writeLocalProducts(all);
    return product;
  },

  updateLocal(product: Product): void {
    const all = readLocalProducts();
    const idx = all.findIndex((p) => p.id === product.id);
    if (idx === -1) return;
    all[idx] = { ...product, localOnly: true };
    writeLocalProducts(all);
  },

  deleteLocal(id: number): void {
    const all = readLocalProducts().filter((p) => p.id !== id);
    writeLocalProducts(all);
  },
  

  async fetchEntireCatalog(opts?: { categorySlug?: string }): Promise<Product[]> {
    if (opts?.categorySlug) {
      try {
        const api = await this.fetchByCategory(opts.categorySlug);
        const merged = this.getMergedCatalog(api);
        return merged.filter((p) => matchesCategoryFilter(p, opts.categorySlug!));
      } catch {
        const all = await this.fetchEntireCatalog();
        return all.filter((p) => matchesCategoryFilter(p, opts.categorySlug!));
      }
    }
    const allApi: Product[] = [];
    let skip = 0;
    let total = Infinity;
    while (skip < total) {
      const res = await this.fetchPage({ limit: 100, skip });
      total = res.total;
      allApi.push(...res.products);
      if (res.products.length === 0) break;
      skip += res.products.length;
    }
    return this.getMergedCatalog(allApi);
  },
 async listAll() {
    try {
      const apiProducts = await productService.fetchEntireCatalog();
      const localProducts = productService.listLocal();

      return [...apiProducts, ...localProducts];
    } catch (e) {
      console.error("Erro ao carregar produtos:", e);
      return productService.listLocal();
    }
  },
};
