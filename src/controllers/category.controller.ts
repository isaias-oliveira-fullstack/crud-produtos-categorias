import type { Request, Response, NextFunction } from "express";
import { CategoryService } from "../services/category.service";
import { categoryRepository } from "../repositories/index";
import { CategoryResponseDto, CategoryListDto } from "../dtos/category.dto";

const categoryService = new CategoryService(categoryRepository);

export const categoryController = {
  async getAll(req: Request, res: Response, next: NextFunction) {
    try {
      const query = req.query as unknown as { page: number; size: number };
      const { categories, total } = categoryService.getAll(query.page, query.size);
      const dto = CategoryListDto.fromEntities(categories, query.page, query.size, total);
      return res.json(dto);
    } catch (error) {
      return next(error);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.params as unknown as { id: number };
      const category = categoryService.getById(params.id);
      return res.json(CategoryResponseDto.fromEntity(category));
    } catch (error) {
      return next(error);
    }
  },

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const body = req.body as { name: string; slug?: string };
      const category = categoryService.create(body.name, body.slug);
      return res.status(201).json(CategoryResponseDto.fromEntity(category));
    } catch (error) {
      return next(error);
    }
  },

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.params as unknown as { id: number };
      const body = req.body as { name: string; slug?: string };
      const category = categoryService.update(params.id, body.name, body.slug);
      return res.json(CategoryResponseDto.fromEntity(category));
    } catch (error) {
      return next(error);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const params = req.params as unknown as { id: number };
      categoryService.delete(params.id);
      return res.sendStatus(204);
    } catch (error) {
      return next(error);
    }
  },
};
