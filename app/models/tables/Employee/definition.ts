import { SchemaDefinition } from "dynamoose/dist/Schema";

export const EmployeeSchemaDefinition: SchemaDefinition = {
    pk: {
        type: String,
        hashKey: true
    },
    sk: {
        type: String,
        rangeKey: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    phone: {
        type: String,
    },
    email: {
        type: String,
        required: true
    },
    tableIds: {
        type: Array,
    },
    roleId: {
        type: String
    },
    isAdmin: {
        type: Boolean,
        default: false
    }
};