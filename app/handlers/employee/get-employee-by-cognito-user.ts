import { APIGatewayEvent } from 'aws-lambda'
import { errorResponse, successResponse } from '../../lib/responses';
import { IGetEmployeeOutDto } from '../../models/dtos/EmployeeInDto';
import { EmployeeService } from '../../services/EmployeeService';
import { getLocationIdFromToken } from '../../lib/utils';


export const handler = async (event: APIGatewayEvent) => {
  
  console.log("request:", JSON.stringify(event, undefined, 2));
  const locationId = getLocationIdFromToken(event);
  let employeeRes;
  try {
    employeeRes = await EmployeeService.getByCognitoUser(locationId, event.pathParameters?.cognitoUser);
  } catch (error) {
    return errorResponse(error.statusCode, error.message)
  }
  
  const response = {
    employeeRes:employeeRes[0]
  }
  return successResponse(response)
}

