import { Document } from "dynamoose/dist/Document";
import { IPartyContract } from "../../Party";
import dynamoose from "../../dynamoose";
import { CommonSchemaSettings } from "../CommonSettings/CommonSchemaSettings";
import { PartySchemaDefinition } from "./definition";

export interface IPartySchema extends IPartyContract, Document {
    pk: string,
    sk: string,
}

export const PartySchema = new dynamoose.Schema(PartySchemaDefinition, {
    ...CommonSchemaSettings
})