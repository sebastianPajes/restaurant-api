import { APIGatewayEvent } from 'aws-lambda'
import { errorResponse, successResponse } from '../lib/responses';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { ICreateRestaurantParams } from '../models/Internal';
import { CreateEmployeeService } from '../services/Employee/CreateEmployeeService';
import { IEmployee } from '../models/Employee';
/**
 * Your lambda handler
 * see infra/stacks.ts for to see where this function is created
 */

 const cognito = new CognitoIdentityServiceProvider();

export const handler = async (event: APIGatewayEvent) => {
  // function code goes here
  console.log("request:", JSON.stringify(event, undefined, 2));
  const eventBody: ICreateRestaurantParams = (event.body ? JSON.parse(event.body) : {});
  const { USER_POOL_ID, TABLE_NAME } = process.env
  let newUserRes;
  let employeeRes;
  try {
    newUserRes = await cognito.adminCreateUser({
      UserPoolId: USER_POOL_ID,
      Username: eventBody.email,
      TemporaryPassword: eventBody.password,
      DesiredDeliveryMediums: ['EMAIL'],
      UserAttributes: [
        { Name: 'phone_number', Value: eventBody.phone},
        { Name: 'email', Value: eventBody.email},
        { Name: 'custom:isAdmin', Value: 'true'},
        { Name: 'email_verified', Value: 'true'},
        { Name: 'phone_number_verified', Value: 'true'}
      ]
    }).promise();
    const employee: IEmployee = {
      companyId: 'abc',
      restaurantId: '123',
      firstName: eventBody.firstName,
      lastName: eventBody.lastName,
      email: eventBody.email,
      roleId: 'xyz',
      cognitoUsername: newUserRes.User.Username
    };

    employeeRes = await CreateEmployeeService.create(employee.companyId, employee.restaurantId, employee);
  } catch (error) {
    return errorResponse(error.statusCode, error.message)
  }
  
  const testResponse = {
    message: "Hello Wolrd",
    name: "Sebastian",
    time: 60,
    request: eventBody,
    userPoolId: USER_POOL_ID,
    tableName: TABLE_NAME,
    newUserRes,
    employeeRes
  }
  return successResponse(testResponse)
}

