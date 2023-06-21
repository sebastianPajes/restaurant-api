import { APIGatewayEvent } from 'aws-lambda'
import { errorResponse, successResponse } from '../../lib/responses';
import { ICreateProductInDto } from '../../models/dtos/ProductInDto';
import { IProduct } from '../../models/Product';
import { getLocationIdFromToken } from "../../lib/utils";
import { ProductRepository } from '../../repositories/Product/ProductRepository';


export const handler = async (event: APIGatewayEvent) => {
  
  console.log("request:", JSON.stringify(event, undefined, 2));
  const locationId = getLocationIdFromToken(event);
  const eventBody: ICreateProductInDto = (event.body ? JSON.parse(event.body) : {});
  let response;
  //TODO: upload image to S3 and save its assetKey
  const product: IProduct = {
    name: eventBody.name,
    description: eventBody.description,
    price: parseInt(eventBody.price),
    isVisibleInMenu: true
  };
  
  try {
    if (event.httpMethod === 'POST') {
      response = await ProductRepository.create(locationId, eventBody.categoryId, product)
    } else if (event.httpMethod === 'PUT') {
      response = await ProductRepository.update(locationId, eventBody.categoryId, eventBody.id, product)
    } else {
      throw new Error(`Unsupported method: ${event.httpMethod}`);
    }
  } catch (error) {
    return errorResponse(error.statusCode, error.message)
  }

  return successResponse(response)
}

