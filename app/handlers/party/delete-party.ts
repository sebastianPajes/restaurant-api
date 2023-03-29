import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromToken } from "../../lib/utils";
import { DeletePartyEventValidator, IPartyPrimaryKeyParams } from "../../models/Party";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { PartyRepository } from '../../repositories/PartyRepository';

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const validatedEvent = await validationWrapper(DeletePartyEventValidator, {
      ...getDataFromToken(event),
        ...event.pathParameters
    })

    delete validatedEvent.employeeId
    
    const partyParam: IPartyPrimaryKeyParams = {
        ...validatedEvent
    }

    console.log(`partyParam: ${partyParam}`)

    const deleteRes = await PartyRepository.deleteById(partyParam)

    return { message: 'Success', data: { deleteRes } }
  }
})