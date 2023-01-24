import { APIGatewayEvent } from 'aws-lambda'
import { errorResponse, successResponse } from '../lib/responses';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { ICreateRestaurantParams } from '../models/Internal';
import { CreateEmployeeService } from '../services/Employee/CreateEmployeeService';
import { IEmployee } from '../models/Employee';

const cognito = new CognitoIdentityServiceProvider();

export const handler = async (event: APIGatewayEvent) => {
  
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
        { Name: 'custom:isAdmin', Value: 'false'},
        { Name: 'email_verified', Value: 'true'}, //ask
        { Name: 'phone_number_verified', Value: 'true'} //ask
      ]
    }).promise();
    const employee: IEmployee = {
      restaurantId: '123',
      firstName: eventBody.firstName,
      lastName: eventBody.lastName,
      email: eventBody.email,
      roleId: 'Employee',
      cognitoUsername: newUserRes.User.Username
    };

    employeeRes = await CreateEmployeeService.create(employee.restaurantId, employee);
  } catch (error) {
    return errorResponse(error.statusCode, error.message)
  }
  
  const testResponse = {
    userPoolId: USER_POOL_ID,
    tableName: TABLE_NAME,
    newUserRes,
    employeeRes
  }
  return successResponse(testResponse)
}

