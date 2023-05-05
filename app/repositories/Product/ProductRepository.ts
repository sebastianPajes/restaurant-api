import {getProductKeys} from "../../lib/helpers/primaryKey"
import { IProduct, IProductPrimaryKeyParams } from "../../models/Product";
import { ProductDBModel } from "../../models/tables/ProductDBModel";

export const ProductRepository = {
    create: async(locationId: string, categoryId: string, product: IProduct) => {
    const productKeys = getProductKeys(locationId, categoryId);
        return await ProductDBModel.create({ ...productKeys, ...product });
    }, 
    getByLocation: async(locationId: string) => {
        const productKeys = getProductKeys(locationId);
        return await ProductDBModel.query('pk')
        .eq(productKeys.pk)
        .exec();
    },
    deleteById: async ({ locationId, categoryId, id }: IProductPrimaryKeyParams) => {
        const primaryKey = getProductKeys(locationId, categoryId, id)
        return await ProductDBModel.delete(primaryKey)
    }
}