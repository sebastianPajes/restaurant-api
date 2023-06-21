import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromApiEvent } from "../../lib/utils";
import { IPartyUpdateParams, PartyInDTO, PartySource, PartyTypes, UpsertPartyEventValidator } from "../../models/Party";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { PartyRepository } from '../../repositories/PartyRepository';
import { randomUUID } from 'crypto';
import { RestaurantTableService } from '../../services/RestaurantTableService';
import { createError } from '../../lib/helpers/errorHelpers/createError';
import { SNS, SSM } from 'aws-sdk';
import { LocationRepository } from '../../repositories/Location/LocationRepository';

const sns = new SNS();
const ssm = new SSM();

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const validatedEvent = await validationWrapper(UpsertPartyEventValidator, {
      ...getDataFromApiEvent(event),
        ...event.pathParameters
    })

    const partyReq = await validationWrapper(PartyInDTO, event.body? JSON.parse(event.body) : {})

    const location = await LocationRepository.getById(validatedEvent.locationId)

    if (partyReq.notify && partyReq.customer.phone) {
      await sendSMS(partyReq.customer.phone, `Tu mesa en ${location.name} esta lista.`)
      return { message: 'Success', data: { partyParam: undefined } }
    }

    let partyDB;

    if (partyReq.id) {
      partyDB = await PartyRepository.getById({
        locationId: validatedEvent.locationId,
        type: validatedEvent.type,
        id: partyReq.id
      })

      if (!partyDB){
        throw new createError.NotFound(`Party with id ${partyReq.id} doesn't exist.`)
      }
      if (partyDB.seated && partyReq.seated) {
        throw new createError.BadRequest(`Party with id ${partyReq.id} is already seated.`)
      }
      if (partyDB.deleted && partyReq.deleted) {
        throw new createError.BadRequest(`Party with id ${partyReq.id} is deleted.`)
      }
    }

    let estimationTimeChanged = !partyDB || partyDB.waitingTime != partyReq.waitingTime



    if (validatedEvent.type == PartyTypes.BOOKING) {
      if (partyReq.source === PartySource.CUSTOMER) {
        throw new Error("Customer can't add a booking")
      }

      if (!partyReq.dateTime) {
        throw new Error("DateTime is required")
      }

      if (!partyReq.duration) {
        throw new Error("Duration is required")
      }

      delete partyReq.waitingTime
    } else {
      if (!partyReq.waitingTime && partyReq.source === PartySource.MANUAL) {
        throw new createError.BadRequest("Waiting time is required")
      }
    }

    if (partyReq.tableCodes.length > 0) {
      // TODO: remove loop and fetch by list of codes
      for (let index = 0; index < partyReq.tableCodes.length; index++) {
        const code = partyReq.tableCodes[index];
        const table = await RestaurantTableService.getByCode(validatedEvent.locationId, code)
        if (!table) {
          throw new createError.NotFound(`Table with code ${code} doesn't exist.`)
        }
        if (table.partyId && table.partyId !== partyReq.id) {
          throw new createError.BadRequest(`Table with code ${code} is already assigned to a party.`)
        }
      }
    }

    if (!partyReq.id) {
      // we try to create
      if (partyReq.source === PartySource.CUSTOMER) {
        partyReq.customer.accepted = false
      }
    } else {
      // we try to update
      if (partyReq.seated) {
        if (partyReq.tableCodes.length > 0) {
          for (let index = 0; index < partyReq.tableCodes.length; index++) { 
            const code = partyReq.tableCodes[index];
            const table = await RestaurantTableService.getByCode(validatedEvent.locationId, code)
            if (!table) {
              throw new createError.NotFound(`Table with code ${code} doesn't exist.`)
            }
            if (table.partyId && table.partyId !== partyReq.id) {
              throw new createError.BadRequest(`Table with code ${code} is already assigned to another party.`)
            }
            delete table.partyId
            await RestaurantTableService.update(validatedEvent.locationId, code, {...table})
          }
        }
      }
    }
    
    const partyParam: IPartyUpdateParams = {
      primaryKeys: {
        locationId: validatedEvent.locationId,
        type: validatedEvent.type,
        id: partyReq.id || randomUUID(),
      },
      attr: {
        ...partyReq,
        employeeId: validatedEvent.employeeId
      }
    }

    console.log(`partyParam: ${partyParam}`)

    await PartyRepository.persist(partyParam)

    console.log(partyReq.customer.phone)

    if (partyReq.customer.phone) {
      let waitlist_app_url = await getWaitlistAppUrl();
      waitlist_app_url += `/waitlist/${validatedEvent.locationId}/tracking/${partyReq.id}`;
      let message;
      // create
      if (partyReq.source === PartySource.MANUAL) {
          if (validatedEvent.type == PartyTypes.WAITLIST && estimationTimeChanged) {
              message = `Tu mesa en ${location.name} estará lista en ${partyReq.waitingTime} minutos aproximadamente. Para ver tu posición en la lista de espera, visite: ${waitlist_app_url}`;
          } else if (validatedEvent.type == PartyTypes.BOOKING) {
            if (partyDB && partyDB.dateTime !== partyDB.dateTime) {
              message = `Tu reserva en ${location.name} para el día ${partyDB.dateTime} se ha actualizado con éxito.`;
            } else if (!partyDB) {
              message = `Tu reserva en ${location.name} para el día ${partyReq.dateTime} se ha realizada con éxito.`;
            }
          }
      } else {
          // customer - waitlist
          if (estimationTimeChanged && partyDB) {
            message = `Acabas de ser añadido a la lista de espera de ${location.name}. Tu mesa estará lista en ${partyReq.waitingTime} minutos aproximadamente. Para ver tu posición en la lista de espera, visite: ${waitlist_app_url}.`;
          }   
      }
      await sendSMS(partyReq.customer.phone, message);
  }
    
    return { message: 'Success', data: {partyParam} }
  }
})

async function sendSMS(phoneNumber: string, message: string): Promise<SNS.PublishResponse> {
  if (!phoneNumber || !message) return
  console.log(phoneNumber, message)
  const params: SNS.PublishInput = {
    Message: message,
    PhoneNumber: phoneNumber,
  };

  const response = await sns.publish(params).promise();
  console.log(response);
  return response;
}

async function getWaitlistAppUrl() {
  const params = {
    Name: '/admin/waitlist-app-url',
    WithDecryption: true,
  };

  try {
    const response = await ssm.getParameter(params).promise();
    return response.Parameter.Value;
  } catch (error) {
    console.error('Error fetching waitlist app URL:', error);
    throw error;
  }
}