import 'reflect-metadata';
import { APIGatewayProxyHandler } from "aws-lambda";
import { getDataFromApiEvent } from "../../lib/utils";
import { validationWrapper } from '../../lib/helpers/wrappers/validationWrapper';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { ProductRepository } from '../../repositories/Product/ProductRepository';
import { IProductPrimaryKeyParams, DeleteProductEventValidator} from "../../models/Product";

export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
    console.log("request:", JSON.stringify(event, undefined, 2));

    const validatedEvent = await validationWrapper(DeleteProductEventValidator, {
      ...getDataFromApiEvent(event),
        ...event.pathParameters,
        ...event.queryStringParameters
    })

    
    const productParam: IProductPrimaryKeyParams = {
        ...validatedEvent
    }

    console.log(`productParam: ${productParam}`)

    const deleteRes = await ProductRepository.deleteById(productParam)

    return { message: 'Success', data: { deleteRes } }
  }
})