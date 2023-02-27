import { APIGatewayEvent } from "aws-lambda";
import { RestaurantTableService } from "../../services/RestaurantTableService";
import { errorResponse, successResponse } from '../../lib/responses';
import { getLocationIdFromToken } from "../../lib/utils";

export const handler = async (event: APIGatewayEvent) => {
    console.log("request:", JSON.stringify(event, undefined, 2));
    const locationId = getLocationIdFromToken(event);
    const code = event.pathParameters?.code;
    let response = {};
  
    try {
        if (!code) throw new Error("The 'code' parameter is missing or invalid. Please provide a valid 'code' value to delete the corresponding table.");
        console.log(code)
        console.log(locationId)
        await RestaurantTableService.delete(locationId, code);
    } catch (error) {
      return errorResponse(error.statusCode, error.message);
    }
    return successResponse(response)
}