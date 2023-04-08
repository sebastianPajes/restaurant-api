import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromApiEvent } from "../../lib/utils";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { CommonEventValidator } from '../../models/eventValidators/CommonEventValidators';
import { LocationRepository } from '../../repositories/Location/LocationRepository';
import { createError } from '../../lib/helpers/errorHelpers/createError';

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const validatedEvent = await validationWrapper(CommonEventValidator, {
      ...getDataFromApiEvent(event),
    })

    const location = await LocationRepository.getById(validatedEvent.locationId)

    if (!location) throw new createError.NotFound(`Location with id ${validatedEvent.locationId} doesn't exist.`)

    return { message: 'Success', data: { location } }
  }
})