import { ICategory } from "../../models/Category";
import { CategoryRepository } from "../../repositories/Category/CategoryRepository";
import { LocationRepository } from "../../repositories/Location/LocationRepository";

export const CreateCategoryService = {
    create: async(locationId: string, category: ICategory) => {
        if (!category) return;
        return CategoryRepository.create(locationId,category)
    }
};