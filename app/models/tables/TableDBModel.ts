
import { SchemaDefinition } from "dynamoose/dist/Schema";
import dynamoose from "../dynamoose";
import { Document } from "dynamoose/dist/Document";

interface ITableDocument extends Document {
    pk: string,
    sk: string,
    size: number
}

const TableSchemaDefinition: SchemaDefinition = {
    pk: {
        type: String,
        hashKey: true
    },
    sk: {
        type: String,
        rangeKey: true
    },
    size: {
        type: Number
    }
}

const TableSchema = new dynamoose.Schema(TableSchemaDefinition)

export const TableDBModel = dynamoose.model<ITableDocument>(
    `${process.env.TABLES_TABLE_NAME}`, 
    TableSchema,
    {
        create: false,
        waitForActive: { enabled: false },
    },
)