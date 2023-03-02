import { getTableKeys } from "../../lib/helpers/primaryKey";
import { IRestaurantTableAttr } from "../../models/RestaurantTables";
import { TableDBModel } from "../../models/tables/TableDBModel";

export const RestaurantTableRepository = {
    create: async(locationId: string, code: string, table: IRestaurantTableAttr) => {
        const primaryKey = getTableKeys(locationId, code)
        return TableDBModel.create({...primaryKey, ...table})
    },
    update: async(locationId: string, code: string, table: IRestaurantTableAttr) => {
        const primaryKey = getTableKeys(locationId, code)
        return TableDBModel.update({...primaryKey, ...table})
    },
    getByLocation: async(locationId: string) => {
        const primaryKey = getTableKeys(locationId, undefined)
        return await TableDBModel.query('pk')
        .eq(primaryKey.pk)
        .exec()
    },
    getByCode: async (locationId: string, code: string) => {
        const primaryKey = getTableKeys(locationId, code)
        return await TableDBModel.query('pk')
        .eq(primaryKey.pk)
        .and()
        .where('sk')
        .eq(primaryKey.sk)
        .exec()
    },
    delete: async (locationId: string, code: string) => {
        const primaryKey = getTableKeys(locationId, code)
        console.log(primaryKey)
        return TableDBModel.delete(primaryKey)
    }
}