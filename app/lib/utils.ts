// Create utility functions here

import { APIGatewayEvent } from "aws-lambda";

export const getLocationIdFromToken = (event: APIGatewayEvent) => {
    return event.requestContext.authorizer.claims["custom:locationId"];
}

export interface IApiGtwEvent {
    locationId: string,
    employeeId: string,
    isInternal: boolean
}

export const getDataFromApiEvent = (event: APIGatewayEvent) : IApiGtwEvent => {
    const isInternal = !!event?.headers['x-api-key']
    const locationId = isInternal ? event?.pathParameters?.locationId : event?.requestContext.authorizer?.claims["custom:locationId"]
    return {
        locationId,
        employeeId: event?.requestContext?.authorizer?.claims["cognito:username"],
        isInternal
    }
}