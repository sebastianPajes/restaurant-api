import { instanceToPlain } from "class-transformer";
import {formatDynamoKeys } from "../../lib/helpers/primaryKey"
import { ICreateLocationParams } from "../../models/Location";
import { LocationDBModel } from "../../models/tables/Location/LocationDBModel";


export const LocationRepository = {
    create: async({primaryKeys, attr}: ICreateLocationParams) => {
        const primaryKey = formatDynamoKeys({ 
            pk: { id: primaryKeys.id } 
        });
        console.log(attr.businessHours)
        const businessHours = instanceToPlain(attr.businessHours)
        console.log(businessHours)
        const Location = new LocationDBModel({
            ...primaryKey,
            ...attr,
            businessHours
        })
        
        console.log(Location)

        return await Location.save()
    },

    getById: async(id: string) => {
        const primaryKey = formatDynamoKeys({pk: { id }})
        return await LocationDBModel.get(primaryKey)
    }
}