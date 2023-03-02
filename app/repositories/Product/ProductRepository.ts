import {getProductKeys} from "../../lib/helpers/primaryKey"
import { IProduct } from "../../models/Product";
import { ProductDBModel } from "../../models/tables/ProductDBModel";

export const ProductRepository = {
    create: async(locationId: string, categoryId: string, product: IProduct) => {
    const primaryKey = getProductKeys(locationId,categoryId);
        return ProductDBModel.create({ ...primaryKey, ...product });
    }
}