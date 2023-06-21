import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromApiEvent } from "../../lib/utils";
import { ICategoryPrimaryKeyParams} from "../../models/Category";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { CommonEventByIdValidator } from '../../models/eventValidators/CommonEventValidators';
import { CategoryRepository } from '../../repositories/Category/CategoryRepository';

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const validatedEvent = await validationWrapper(CommonEventByIdValidator, {
      ...getDataFromApiEvent(event),
        ...event.pathParameters
    })

    
    const categoryParam: ICategoryPrimaryKeyParams = {
        ...validatedEvent
    }

    console.log(`categoryParam: ${categoryParam}`)

    const deleteRes = await CategoryRepository.deleteById(categoryParam)

    return { message: 'Success', data: { deleteRes } }
  }
})