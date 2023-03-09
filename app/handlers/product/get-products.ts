import { APIGatewayEvent } from "aws-lambda";
import { errorResponse, successResponse } from '../../lib/responses';
import { getLocationIdFromToken } from "../../lib/utils";
import { ProductService } from "../../services/ProductService";

export const handler = async (event: APIGatewayEvent) => {
    console.log("request:", JSON.stringify(event, undefined, 2));
    const locationId = getLocationIdFromToken(event);
    let response;
  
    try {
        response = await ProductService.getByLocation(locationId);
    } catch (error) {
      return errorResponse(error.statusCode, error.message);
    }
    return successResponse(response)
}