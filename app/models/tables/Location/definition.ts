import { SchemaDefinition } from "dynamoose/dist/Schema";

const businessHoursSchema: SchemaDefinition = {
    Monday: {
      type: String
    },
    Tuesday: {
      type: String
    },
    Wednesday: {
      type: String
    },
    Thursday: {
      type: String
    },
    Friday: {
      type: String
    },
    Saturday: {
      type: String
    },
    Sunday: {
      type: String
    }
  };

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
        schema: businessHoursSchema
    },
    defaultWaitingTime: {
      type: String,
      required: true
    }
};