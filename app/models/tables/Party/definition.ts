import { SchemaDefinition } from "dynamoose/dist/Schema";

const CustomerSchemaDefinition: SchemaDefinition = {
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true
    },
    partySize: {
        type: Number,
        required: true
    },
    accepted: {
        type: Boolean,
        default: false
    }
};

export const PartySchemaDefinition: SchemaDefinition = {
    pk: {
        type: String,
        hashKey: true
    },
    sk: {
        type: String,
        rangeKey: true
    },
    notes: {
        type: String
    },
    waitingTime: {
        type: String,
    },
    dateTime: {
        type: String
    },
    duration: {
        type: Number
    },
    tableCodes: {
        type: Array,
        schema: [String]
    },
    tags: {
        type: Array,
        schema: [String]
    },
    seated: {
        type: Boolean,
        required: true,
    },
    deleted: {
        type: Boolean,
        required: true
    },
    source: {
        type: String,
        required: true,
    },
    employeeId: {
        type: String
    },
    customer: {
        type: Object,
        schema: CustomerSchemaDefinition
    }
};