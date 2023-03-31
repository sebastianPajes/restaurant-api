import { instanceToPlain } from "class-transformer";
import { formatDynamoKeys } from "../lib/helpers/primaryKey";
import { IPartyPrimaryKeyParams, IPartyUpdateParams } from "../models/Party";
import { PartyDBModel } from "../models/tables/Party/PartyDBModel";

export const PartyRepository = {
    persist: async({ primaryKeys, attr }: IPartyUpdateParams) => {
        const primaryKey = formatDynamoKeys({
            pk: { locationId: primaryKeys.locationId },
            sk: { type: primaryKeys.type, id: primaryKeys.id }
        })
        const customer = instanceToPlain(attr.customer)
        const Party = new PartyDBModel({
            ...primaryKey,
            ...attr,
            customer
        })
        
        console.log(Party)

        await Party.save()
    },
    getByLocation: async(locationId: string) => {
        const primaryKey = formatDynamoKeys({pk: { locationId }})
        return await PartyDBModel.query('pk')
        .eq(primaryKey.pk)
        .exec()
    },
    getByType: async({ locationId, type }: Omit<IPartyPrimaryKeyParams, 'id'>) => {
        const primaryKey = formatDynamoKeys({pk: { locationId }, sk: { type }})
        console.log(primaryKey)
        return await PartyDBModel.query('pk')
        .eq(primaryKey.pk)
        .and()
        .where("sk")
        .beginsWith(primaryKey.sk)
        .exec()
    },
    getById: async ({ locationId, type, id }: IPartyPrimaryKeyParams) => {
        const primaryKey = formatDynamoKeys({pk: { locationId }, sk: { type, id }})
        console.log(primaryKey)
        return await PartyDBModel.get(primaryKey)
        
    },
    deleteById: async ({ locationId, type, id }: IPartyPrimaryKeyParams) => {
        const primaryKey = formatDynamoKeys({pk: { locationId }, sk: { type, id }})
        
        return await PartyDBModel.delete(primaryKey)
    }
}