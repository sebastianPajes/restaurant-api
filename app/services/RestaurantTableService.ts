import { IRestaurantTableAttr } from "../models/RestaurantTables"
import { RestaurantTableRepository } from "../repositories/RestaurantTable/RestaurantTableRepository"

export const RestaurantTableService = {
    create: async (locationId: string, code: string, table: IRestaurantTableAttr) => {
        return await RestaurantTableRepository.create(locationId, code, table)
    },
    update: async (locationId: string, code: string, table: IRestaurantTableAttr) => {
        return await RestaurantTableRepository.update(locationId, code, table)
    },
    getByLocation: async (locationId: string) => {
        return await RestaurantTableRepository.getByLocation(locationId)
    },
    getByCode: async (locationId: string, code: string) => {
        return await RestaurantTableRepository.getByCode(locationId, code)
    },  
    delete: async (locationId: string, code: string) => {
        await RestaurantTableRepository.delete(locationId, code)
    }  
}