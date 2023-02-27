import { APIGatewayEvent } from "aws-lambda";
import { RestaurantTableService } from "../../services/RestaurantTableService";
import { errorResponse, successResponse } from '../../lib/responses';
import { getLocationIdFromToken } from "../../lib/utils";

export const handler = async (event: APIGatewayEvent) => {
    console.log("request:", JSON.stringify(event, undefined, 2));
    const locationId = getLocationIdFromToken(event);
    const code = event.queryStringParameters?.code;
    let response;
  
    try {
      if (code) {
        response = await RestaurantTableService.getByCode(locationId, code);
      } else {
        response = await RestaurantTableService.getByLocation(locationId);
      }
    } catch (error) {
      return errorResponse(error.statusCode, error.message);
    }
    return successResponse(response)
}