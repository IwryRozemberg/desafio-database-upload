import { getRepository } from 'typeorm';
import Category from '../models/Category';

interface CategoryRequest {
  title: string;
}

export default class CreateCategoryService {
  public async execute({ title }: CategoryRequest): Promise<Category> {
    const categoriesRepository = getRepository(Category);
    let category = await categoriesRepository.findOne({ title });

    if (!category) {
      category = categoriesRepository.create({ title });
      await categoriesRepository.save(category);
    }

    return category;
  }
}
