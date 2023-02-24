import {getCategoryKeys} from "../../lib/helpers/primaryKey"
import { ICategory } from "../../models/Category";
import { CategoryDBModel } from "../../models/tables/CategoryDBModel";

export const CategoryRepository = {
    create: async(locationId: string, category: ICategory) => {
    const primaryKey = getCategoryKeys(locationId);
        return CategoryDBModel.create({ ...primaryKey, ...category })
    }
}