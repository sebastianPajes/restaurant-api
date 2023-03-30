import { APIGatewayEvent } from "aws-lambda";
import { errorResponse, successResponse } from '../../lib/responses';
import { getLocationIdFromToken } from "../../lib/utils";
import { EmployeeService } from "../../services/EmployeeService";

export const handler = async (event: APIGatewayEvent) => {
    console.log("request:", JSON.stringify(event, undefined, 2));
    const locationId = getLocationIdFromToken(event);
    const cognitoUser = event.pathParameters?.cognitoUser;
    let response = {};
  
    try {
        if (!cognitoUser) throw new Error("The 'cognitoUser' parameter is missing or invalid. Please provide a valid 'cognitoUser' value to delete the corresponding employee.");
        console.log(cognitoUser)
        console.log(locationId)
        await EmployeeService.delete(locationId, cognitoUser);
    } catch (error) {
      return errorResponse(error.statusCode, error.message);
    }
    return successResponse(response)
}