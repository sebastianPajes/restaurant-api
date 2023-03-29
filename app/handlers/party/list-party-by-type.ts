import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromToken } from "../../lib/utils";
import { FindPartyByTypeEventValidator, IPartyPrimaryKeyParams } from "../../models/Party";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { PartyRepository } from '../../repositories/PartyRepository';

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const validatedEvent = await validationWrapper(FindPartyByTypeEventValidator, {
      ...getDataFromToken(event),
        ...event.pathParameters
    })

    delete validatedEvent.employeeId
    
    const partyParam: Omit<IPartyPrimaryKeyParams, 'id'> = {
        ...validatedEvent
    }

    console.log(`partyParam: ${partyParam}`)

    const parties = await PartyRepository.getByType(partyParam)

    return { message: 'Success', data: { parties } }
  }
})