import { Document } from "dynamoose/dist/Document";
import dynamoose from "../../dynamoose";
import { CommonSchemaSettings } from "../CommonSettings/CommonSchemaSettings";
import { LocationSchemaDefinition } from "./definition";
import { ILocationContract } from "../../Location";

export interface ILocationSchema extends ILocationContract, Document {
    pk: string,
}

export const LocationSchema = new dynamoose.Schema(LocationSchemaDefinition, {
    ...CommonSchemaSettings
})