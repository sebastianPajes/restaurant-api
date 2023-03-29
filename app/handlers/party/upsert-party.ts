import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromToken } from "../../lib/utils";
import { IPartyUpdateParams, PartyInDTO, UpsertPartyEventValidator } from "../../models/Party";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { PartyRepository } from '../../repositories/PartyRepository';

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const validatedEvent = await validationWrapper(UpsertPartyEventValidator, {
      ...getDataFromToken(event),
        ...event.pathParameters
    })

    const partyReq = await validationWrapper(PartyInDTO, event.body? JSON.parse(event.body) : {})
    
    const partyParam: IPartyUpdateParams = {
      primaryKeys: {
        locationId: validatedEvent.locationId,
        type: validatedEvent.type,
        id: partyReq.id,
      },
      attr: {
        ...partyReq,
        employeeId: validatedEvent.employeeId
      }
    }

    console.log(`partyParam: ${partyParam}`)

    await PartyRepository.persist(partyParam)

    return { message: 'Success', data: {partyParam} }
  }
})