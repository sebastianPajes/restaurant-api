import { IProduct } from "../models/Product";
import { ProductRepository } from "../repositories/Product/ProductRepository";

export const ProductService = {
    create: async(locationId: string, categoryId: string, product: IProduct) => {
        if (!product) return;
        return ProductRepository.create(locationId, categoryId, product)
    },
    getByLocation: async(locationId: string) => {
        return ProductRepository.getByLocation(locationId)
    }
};