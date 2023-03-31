import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { CreateLocationInDTO, ICreateLocationParams } from '../../models/Location';
import { LocationRepository } from '../../repositories/Location/LocationRepository';
import { CognitoIdentityServiceProvider } from 'aws-sdk';
import { IPersistEmployeeParams } from '../../models/Employee';
import { EmployeeRepository } from '../../repositories/Employee/EmployeeRepository';

const cognito = new CognitoIdentityServiceProvider();
const { USER_POOL_ID} = process.env

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const locationReq = await validationWrapper(CreateLocationInDTO, event.body? JSON.parse(event.body) : {})

    const locationParam: ICreateLocationParams = {
        primaryKeys: {
            id: locationReq.id
        },
        attr: {
            name: locationReq.name,
            address: locationReq.address,
            businessHours: locationReq.businessHours,
            qrCodeWaitlist: "abcd"
        }
    }
    
    console.log(`locationReq: ${JSON.stringify(locationReq)}`);
    console.log(`locationParam: ${JSON.stringify(locationParam)}`);

    const locationRes = await LocationRepository.create(locationParam)
    console.log(`locationRes: ${JSON.stringify(locationRes)}`);

    const newUserRes = await cognito.adminCreateUser({
        UserPoolId: USER_POOL_ID,
        Username: locationReq.email,
        TemporaryPassword: locationReq.password,
        DesiredDeliveryMediums: ['EMAIL'],
        UserAttributes: [
          { Name: 'phone_number', Value: locationReq.phone},
          { Name: 'email', Value: locationReq.email},
          { Name: 'custom:isAdmin', Value: 'true'},
          { Name: 'custom:locationId', Value: locationReq.id},
          { Name: 'email_verified', Value: 'true'},
          { Name: 'phone_number_verified', Value: 'true'}
        ]
      }).promise();

    console.log(`newUserRes: ${newUserRes}`)

    const employeeParam: IPersistEmployeeParams = {
        primaryKeys: {
            locationId: locationReq.id,
            id: newUserRes.User.Username
        },
        attr: {
            firstName: locationReq.firstName,
            phone: locationReq.phone,
            lastName: locationReq.lastName,
            email: locationReq.email,
            isAdmin: true
        }
    }

    console.log(`employeeParam: ${employeeParam}`)

    const employeeRes = await EmployeeRepository.persist(employeeParam)

    return { message: 'Success', data: {locationRes, newUserRes, employeeRes} }
  }
})