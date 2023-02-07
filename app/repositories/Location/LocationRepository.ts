import {getLocationPrimaryKeysV2 } from "../../lib/helpers/primaryKey"
import { ILocation } from "../../models/Location";
import { LocationDBModel } from "../../models/tables/LocationDBModel";

export const LocationRepository = {
    create: async(location: ILocation) => {
    const primaryKey = getLocationPrimaryKeysV2();
        return LocationDBModel.create({ ...primaryKey, ...location })
    }
}