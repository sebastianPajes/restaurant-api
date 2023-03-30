import { Document } from "dynamoose/dist/Document";
import dynamoose from "../../dynamoose";
import { CommonSchemaSettings } from "../CommonSettings/CommonSchemaSettings";
import { IEmployeeContract } from "../../Employee";
import { EmployeeSchemaDefinition } from "./definition";

export interface IEmployeeSchema extends IEmployeeContract, Document {
    pk: string,
    sk: string,
}

export const EmployeeSchema = new dynamoose.Schema(EmployeeSchemaDefinition, {
    ...CommonSchemaSettings
})