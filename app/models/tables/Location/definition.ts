import { SchemaDefinition } from "dynamoose/dist/Schema";

export const LocationSchemaDefinition: SchemaDefinition = {
    pk: {
        type: String,
        hashKey: true
    },
    name: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    qrCodeWaitlist: {
        type: String,
        required: true
    },
    businessHours: {
        type: Object,
    }
};