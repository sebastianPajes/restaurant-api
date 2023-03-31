import {getCategoryKeys} from "../../lib/helpers/primaryKey"
import { ICategory } from "../../models/Category";
import { CategoryDBModel } from "../../models/tables/CategoryDBModel";

export const CategoryRepository = {
    create: async(locationId: string, category: ICategory) => {
    const categoryKeys = getCategoryKeys(locationId);
        return await CategoryDBModel.create({ ...categoryKeys, ...category })
    },    
    getByLocation: async(locationId: string) => {
        const categoryKeys = getCategoryKeys(locationId)
        return await CategoryDBModel.query('pk')
        .eq(categoryKeys.pk)
        .exec();
    },
}