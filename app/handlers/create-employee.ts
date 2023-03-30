// import { APIGatewayEvent } from 'aws-lambda'
// import { errorResponse, successResponse } from '../lib/responses';
// import { CognitoIdentityServiceProvider } from 'aws-sdk';
// import { ICreateEmployeeInDto } from '../models/dtos/EmployeeInDto';
// import { CreateEmployeeService } from '../services/Employee/CreateEmployeeService';
// import { IEmployee } from '../models/Employee';
// import { getLocationIdFromToken } from '../lib/utils';

// const cognito = new CognitoIdentityServiceProvider();

// export const handler = async (event: APIGatewayEvent) => {
  
//   console.log("request:", JSON.stringify(event, undefined, 2));
//   const locationId = getLocationIdFromToken(event);
//   const eventBody: ICreateEmployeeInDto = (event.body ? JSON.parse(event.body) : {});
//   const { USER_POOL_ID} = process.env
//   let newUserRes;
//   let employeeRes;
//   try {
//     newUserRes = await cognito.adminCreateUser({
//       UserPoolId: USER_POOL_ID,
//       Username: eventBody.email,
//       TemporaryPassword: eventBody.password,
//       DesiredDeliveryMediums: ['EMAIL'],
//       UserAttributes: [
//         { Name: 'phone_number', Value: eventBody.phone},
//         { Name: 'email', Value: eventBody.email},
//         { Name: 'custom:isAdmin', Value: 'false'},
//         { Name: 'custom:locationId', Value: locationId},
//         { Name: 'email_verified', Value: 'true'}, //ask
//         { Name: 'phone_number_verified', Value: 'true'} //ask
//       ]
//     }).promise();
//     const employee: IEmployee = {
//       locationId,
//       firstName: eventBody.firstName,
//       lastName: eventBody.lastName,
//       email: eventBody.email,
//       roleId: 'abc',
//       cognitoUsername: newUserRes.User.Username,
//       isAdmin:false
//     };

//     employeeRes = await CreateEmployeeService.create(employee.locationId, employee);
//   } catch (error) {
//     return errorResponse(error.statusCode, error.message)
//   }
  
//   const testResponse = {
//     userPoolId: USER_POOL_ID,
//     newUserRes,
//     employeeRes
//   }
//   return successResponse(testResponse)
// }

