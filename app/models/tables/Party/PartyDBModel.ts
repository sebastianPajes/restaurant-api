import dynamoose from "../../dynamoose";
import { IPartySchema, PartySchema } from "./schema";

export const PartyDBModel = dynamoose.model<IPartySchema>(`${process.env.PARTY_TABLE_NAME}`, PartySchema, {
    create: false,
    waitForActive: { enabled: false }
})