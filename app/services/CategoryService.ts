import { ICategory } from "../models/Category";
import { CategoryRepository } from "../repositories/Category/CategoryRepository";

export const CategoryService = {
    create: async(locationId: string, category: ICategory) => {
        if (!category) return;
        return CategoryRepository.create(locationId, category)
    },
    getByLocation: async(locationId: string) => {
        return CategoryRepository.getByLocation(locationId)
    },
};