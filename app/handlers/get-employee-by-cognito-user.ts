// import { APIGatewayEvent } from 'aws-lambda'
// import { errorResponse, successResponse } from '../lib/responses';
// import { IGetEmployeeOutDto } from '../models/dtos/EmployeeInDto';
// import { ListEmployeeService } from '../services/Employee/ListEmployeeService';


// export const handler = async (event: APIGatewayEvent) => {
  
//   console.log("request:", JSON.stringify(event, undefined, 2));
//   let employeeRes;
//   try {
//     employeeRes = await ListEmployeeService.findByCognitoUser(event.pathParameters.id);
//   } catch (error) {
//     return errorResponse(error.statusCode, error.message)
//   }
  
//   const response = {
//     employeeRes:employeeRes[0]
//   }
//   return successResponse(response)
// }

