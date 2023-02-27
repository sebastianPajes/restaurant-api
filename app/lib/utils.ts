// Create utility functions here

import { APIGatewayEvent } from "aws-lambda";

export const getLocationIdFromToken = (event: APIGatewayEvent) => {
    return event.requestContext.authorizer.claims["custom:locationId"];
}