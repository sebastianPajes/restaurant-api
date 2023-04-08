import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromApiEvent } from "../../lib/utils";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { CommonEventValidator } from '../../models/eventValidators/CommonEventValidators';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { IPersistEmployeeParams, PersistEmployeeDTO } from '../../models/Employee';
import { EmployeeRepository } from '../../repositories/Employee/EmployeeRepository';

const cognito = new CognitoIdentityServiceProvider();

const { USER_POOL_ID} = process.env

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const validatedEvent = await validationWrapper(CommonEventValidator, {
      ...getDataFromApiEvent(event),
    })

    const employeeReq = await validationWrapper(PersistEmployeeDTO, event.body? JSON.parse(event.body) : {})

    // TODO: cognito should listen to employee events
    if (employeeReq.id) {
      // update
      await cognito.adminUpdateUserAttributes({
        UserAttributes: [
          { Name: 'email', Value: employeeReq.email },
          { Name: 'phone_number', Value: employeeReq.phone },
          { Name: 'email_verified', Value: 'true'},
          { Name: 'phone_number_verified', Value: 'true'}
        ],
        UserPoolId: USER_POOL_ID,
        Username: employeeReq.id
      })
      .promise()
    } else {
      // create
      const newUserRes = await cognito.adminCreateUser({
        UserPoolId: USER_POOL_ID,
        Username: employeeReq.email,
        TemporaryPassword: employeeReq.temporaryPassword,
        DesiredDeliveryMediums: ['EMAIL'],
        UserAttributes: [
          { Name: 'phone_number', Value: employeeReq.phone},
          { Name: 'email', Value: employeeReq.email},
          { Name: 'custom:isAdmin', Value: 'false'},
          { Name: 'custom:locationId', Value: validatedEvent.locationId},
          { Name: 'email_verified', Value: 'true'}, //ask
          { Name: 'phone_number_verified', Value: 'true'} //ask
        ]
      }).promise();
  
      console.log(`newUserRes: ${newUserRes}`)
      employeeReq.id = newUserRes.User.Username
    }

    const employeeParam: IPersistEmployeeParams = {
      primaryKeys: {
        locationId: validatedEvent.locationId,
        id: employeeReq.id
      }, 
      attr: {
        firstName: employeeReq.firstName,
        lastName: employeeReq.lastName,
        email: employeeReq.email,
        phone: employeeReq.phone,
        isAdmin: employeeReq.isAdmin
      }
    }

  
    await EmployeeRepository.persist(employeeParam)

    return { message: 'Success', data: {employeeParam} }
  }
})