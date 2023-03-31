import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromToken } from "../../lib/utils";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { CommonEventValidator } from '../../models/eventValidators/CommonEventValidators';
import { EmployeeRepository } from '../../repositories/Employee/EmployeeRepository';

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const validatedEvent = await validationWrapper(CommonEventValidator, {
      ...getDataFromToken(event),
    })
    
    console.log(`validatedEvent: ${validatedEvent}`)

    const employees = await EmployeeRepository.getByLocation(validatedEvent.locationId)

    console.log(employees)

    return { message: 'Success', data: { employees } }
  }
})