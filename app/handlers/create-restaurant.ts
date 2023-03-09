import { APIGatewayEvent } from 'aws-lambda'
import { errorResponse, successResponse } from '../lib/responses';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { ICreateRestaurantInDto } from '../models/dtos/RestaurantlnDto';
import { EmployeeService } from '../services/EmployeeService';
import { IEmployee} from '../models/Employee';
import { ILocation} from '../models/Location';
import { LocationService } from '../services/LocationService';
/**
 * Your lambda handler
 * see infra/stacks.ts for to see where this function is created
 */

const cognito = new CognitoIdentityServiceProvider();

export const handler = async (event: APIGatewayEvent) => {
  
  console.log("request:", JSON.stringify(event, undefined, 2));
  const eventBody: ICreateRestaurantInDto = (event.body ? JSON.parse(event.body) : {});
  const { USER_POOL_ID} = process.env
  let newUserRes;
  let employeeRes;
  let locationRes;
  try {

  //locations
    const location: ILocation = {
      name:"Default Location"
    };
    locationRes = await LocationService.create(location);

    const locationId = locationRes.pk.split('#')[1];
    newUserRes = await cognito.adminCreateUser({
      UserPoolId: USER_POOL_ID,
      Username: eventBody.email,
      TemporaryPassword: eventBody.password,
      DesiredDeliveryMediums: ['EMAIL'],
      UserAttributes: [
        { Name: 'phone_number', Value: eventBody.phone},
        { Name: 'email', Value: eventBody.email},
        { Name: 'custom:isAdmin', Value: 'true'},
        { Name: 'custom:locationId', Value: locationId},
        { Name: 'email_verified', Value: 'true'},
        { Name: 'phone_number_verified', Value: 'true'}
      ]
    }).promise();



      //admin
      const admin: IEmployee = {
      firstName: eventBody.firstName,
      lastName: eventBody.lastName,
      email: eventBody.email,
      roleId: 'xyz',
      isAdmin:true
    };

    employeeRes = await EmployeeService.create(locationId, newUserRes.User.Username, admin);
  } catch (error) {
    return errorResponse(error.statusCode, error.message)
  }
  
  const testResponse = {
    userPoolId: USER_POOL_ID,
    newUserRes,
    employeeRes,
    locationRes
  }
  return successResponse(testResponse)
}

