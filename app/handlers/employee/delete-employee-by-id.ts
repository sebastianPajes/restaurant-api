import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromApiEvent } from "../../lib/utils";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { CommonEventByIdValidator } from '../../models/eventValidators/CommonEventValidators';
import { IEmployeePrimaryKeyParams } from '../../models/Employee';
import { EmployeeRepository } from '../../repositories/Employee/EmployeeRepository';
import { CognitoIdentityServiceProvider } from 'aws-sdk';

const cognito = new CognitoIdentityServiceProvider();

const { USER_POOL_ID} = process.env

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const validatedEvent = await validationWrapper(CommonEventByIdValidator, {
      ...getDataFromApiEvent(event),
      ...event.pathParameters
    })
    
    const employeeParam: IEmployeePrimaryKeyParams = {
        locationId: validatedEvent.locationId,
        id: validatedEvent.id
    }

    console.log(`partyParam: ${employeeParam}`)

    const employee = await EmployeeRepository.deleteById(employeeParam)

    console.log(employee)

    const deleteUser = await cognito.adminDeleteUser({
        UserPoolId: USER_POOL_ID,
        Username: validatedEvent.id,
    }).promise()

    console.log(deleteUser)

    return { message: 'Success', data: { employee, deleteUser } }
  }
})