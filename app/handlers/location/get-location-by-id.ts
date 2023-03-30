import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromToken } from "../../lib/utils";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { CommonEventValidator } from '../../models/eventValidators/CommonEventValidators';
import { LocationRepository } from '../../repositories/Location/LocationRepository';

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const validatedEvent = await validationWrapper(CommonEventValidator, {
      ...getDataFromToken(event),
    })

    const location = await LocationRepository.getById(validatedEvent.locationId)

    return { message: 'Success', data: { location } }
  }
})