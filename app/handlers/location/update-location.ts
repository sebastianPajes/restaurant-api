import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { IUpdateLocationParams, UpdateLocationInDTO } from '../../models/Location';
import { LocationRepository } from '../../repositories/Location/LocationRepository';
import { CommonEventValidator } from '../../models/eventValidators/CommonEventValidators';
import { getDataFromApiEvent } from '../../lib/utils';
import { createError } from '../../lib/helpers/errorHelpers/createError';

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    const { locationId } = await validationWrapper(CommonEventValidator, {
        ...getDataFromApiEvent(event),
      })
  
      const location = await LocationRepository.getById(locationId)
  
      if (!location) throw new createError.NotFound(`Location with id ${locationId} doesn't exist.`)

    const locationReq = await validationWrapper(UpdateLocationInDTO, event.body? JSON.parse(event.body) : {})

    const locationParam: IUpdateLocationParams = {
        primaryKeys: {
            id: locationId
        },
        attr: {
            name: locationReq.name,
            address: locationReq.address,
            businessHours: locationReq.businessHours,
            defaultWaitingTime: locationReq.defaultWaitingTime,
            phone: locationReq.phone
        }
    }
    
    console.log(`locationReq: ${JSON.stringify(locationReq)}`);
    console.log(`locationParam: ${JSON.stringify(locationParam)}`);

    const locationRes = await LocationRepository.update(locationParam)
    console.log(`locationRes: ${JSON.stringify(locationRes)}`);

    return { message: 'Success', data: {locationRes} }
  }
})
