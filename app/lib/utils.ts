// Create utility functions here

import { APIGatewayEvent } from "aws-lambda";

export const getLocationIdFromToken = (event: APIGatewayEvent) => {
    return event.requestContext.authorizer.claims["custom:locationId"];
}

export interface IToken {
    locationId: string,
    employeeId: string
}

export const getDataFromToken = (event: APIGatewayEvent) : IToken => {
    return {
        locationId: event.requestContext.authorizer.claims["custom:locationId"],
        employeeId: event.requestContext.authorizer.claims["cognito:username"]
    }
}