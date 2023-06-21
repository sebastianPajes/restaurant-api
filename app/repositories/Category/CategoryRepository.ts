import {getCategoryKeys} from "../../lib/helpers/primaryKey"
import { ICategory, ICategoryPrimaryKeyParams } from "../../models/Category";
import { CategoryDBModel } from "../../models/tables/CategoryDBModel";

export const CategoryRepository = {
    create: async(locationId: string, category: ICategory) => {
        const categoryKeys = getCategoryKeys(locationId);
        return await CategoryDBModel.create({ ...categoryKeys, ...category });
    },    
    update: async(locationId: string, id:string, category: ICategory) => {
        const categoryKeys = getCategoryKeys(locationId, id);
        return await CategoryDBModel.update({ ...categoryKeys, ...category });
    },
    getByLocation: async(locationId: string) => {
        const categoryKeys = getCategoryKeys(locationId)
        return await CategoryDBModel.query('pk')
        .eq(categoryKeys.pk)
        .exec();
    },
    deleteById: async ({ locationId, id }: ICategoryPrimaryKeyParams) => {
        const primaryKey = getCategoryKeys(locationId, id)
        return await CategoryDBModel.delete(primaryKey)
    }
}