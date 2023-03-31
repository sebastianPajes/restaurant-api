import dynamoose from "../../dynamoose";

import { ILocationSchema, LocationSchema } from "./schema";

export const LocationDBModel = dynamoose.model<ILocationSchema>(`${process.env.LOCATION_TABLE_NAME}`, LocationSchema, {
    create: false,
    waitForActive: { enabled: false }
})