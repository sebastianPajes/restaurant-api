import { IProduct } from "../../models/Product";
import { ProductRepository } from "../../repositories/Product/ProductRepository";

export const CreateProductService = {
    create: async(locationId: string, categoryId: string, product: IProduct) => {
        if (!product) return;
        return ProductRepository.create(locationId, categoryId, product)
    }
};