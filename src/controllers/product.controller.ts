import type { Request, Response, NextFunction } from "express";
import { ProductService } from "../services/product.service";
import { categoryRepository, productRepository } from "../repositories/index";
import { ProductResponseDto, ProductListDto } from "../dtos/product.dto";

const productService = new ProductService(productRepository, categoryRepository);

function slugifyText(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "")
    .toLowerCase()
    .replace(/^-+|-+$/g, "");
}

function mapProductToDto(product: ReturnType<ProductService["getById"]>): ProductResponseDto {
  const category = categoryRepository.getCategoryById(product.categoryId);
  return ProductResponseDto.fromEntity(
    product,
    {
      id: category?.id ?? product.categoryId,
      title: category?.name ?? "Categoria desconhecida",
    },
    slugifyText(product.name)
  );
}

export const productController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as {
        page: number;
        size: number;
        skip: number;
        limit: number;
        category?: string;
      };
      const page = query.skip ? Math.floor(query.skip / query.limit) + 1 : query.page;
      const size = query.limit || query.size;
      const { products, total } = productService.getAll(page, size, query.category);
      const dto = ProductListDto.fromEntities(
        products.map((product) => mapProductToDto(product)),
        page,
        size,
        total
      );
      return res.json(dto);
    } catch (error) {
      return next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.params as unknown as { id: number };
      const product = productService.getById(params.id);
      return res.json(mapProductToDto(product));
    } catch (error) {
      return next(error);
    }
  },

  async getBySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.params as unknown as { slug: string };
      const product = productService.getBySlug(params.slug);
      return res.json(mapProductToDto(product));
    } catch (error) {
      return next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as unknown as {
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
      };
      const product = productService.create(body);
      return res.status(201).json(mapProductToDto(product));
    } catch (error) {
      return next(error);
    }
  },

  async listByCategorySlug(req: Request, res: Response, next: NextFunction) {
    try {
      const slug = String(req.params.slug ?? "").trim();
      const query = req.query as unknown as {
        page: number;
        size: number;
        skip: number;
        limit: number;
      };
      const page = query.skip ? Math.floor(query.skip / query.limit) + 1 : query.page;
      const size = query.limit || query.size;
      const { products, total } = productService.getByCategorySlug(slug, page, size);
      const dto = ProductListDto.fromEntities(
        products.map((product) => mapProductToDto(product)),
        page,
        size,
        total
      );
      return res.json(dto);
    } catch (error) {
      return next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.params as unknown as { id: number };
      const body = req.body as unknown as {
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
      };
      const product = productService.update(params.id, body);
      return res.json(mapProductToDto(product));
    } catch (error) {
      return next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.params as unknown as { id: number };
      productService.delete(params.id);
      return res.sendStatus(204);
    } catch (error) {
      return next(error);
    }
  },
};
