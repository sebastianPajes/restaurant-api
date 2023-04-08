import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromApiEvent } from "../../lib/utils";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { CommonEventByIdValidator } from '../../models/eventValidators/CommonEventValidators';
import { IEmployeePrimaryKeyParams } from '../../models/Employee';
import { EmployeeRepository } from '../../repositories/Employee/EmployeeRepository';

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

    const employee = await EmployeeRepository.getById(employeeParam)

    console.log(employee)

    return { message: 'Success', data: { employee } }
  }
})