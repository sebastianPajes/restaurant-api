import { APIGatewayEvent } from "aws-lambda";
import { IRestaurantTable } from "../../models/RestaurantTables";
import { RestaurantTableService } from "../../services/RestaurantTableService";
import { IRestaurantTableAttr } from "../../models/RestaurantTables";
import { errorResponse, successResponse } from '../../lib/responses';
import { getLocationIdFromToken } from "../../lib/utils";

export const handler = async (event: APIGatewayEvent) => {
    console.log("request:", JSON.stringify(event, undefined, 2));
    const locationId = getLocationIdFromToken(event);
    const eventBody: IRestaurantTable = (event.body ? JSON.parse(event.body) : {});
    const tableAttr: IRestaurantTableAttr = {
        size: eventBody.size
    }
    let response;
    try {
        if (event.httpMethod === 'POST') {
          response = await RestaurantTableService.create(locationId, eventBody.code, tableAttr);
        } else if (event.httpMethod === 'PUT') {
          response = await RestaurantTableService.update(locationId, eventBody.code, tableAttr);
        } else {
          throw new Error(`Unsupported method: ${event.httpMethod}`);
        }
      } catch (error) {
        return errorResponse(error.statusCode, error.message);
      }
    return successResponse(response)
}