import { APIGatewayEvent } from 'aws-lambda'
import { errorResponse, successResponse } from '../../lib/responses';
import { ICreateProductInDto } from '../../models/dtos/ProductInDto';
import { IProduct } from '../../models/Product';
import { ProductService } from '../../services/ProductService';
import { getLocationIdFromToken } from "../../lib/utils";


export const handler = async (event: APIGatewayEvent) => {
  
  console.log("request:", JSON.stringify(event, undefined, 2));
  const locationId = getLocationIdFromToken(event);
  const eventBody: ICreateProductInDto = (event.body ? JSON.parse(event.body) : {});
  let productRes;
  try {
    //TODO: upload image to S3 and save its assetKey

    const product: IProduct = {
      name:eventBody.name,
      description:eventBody.description,
      price: parseInt(eventBody.price),
      isVisibleInMenu:true
    };
    productRes = await ProductService.create(locationId, eventBody.categoryId, product);
  } catch (error) {
    return errorResponse(error.statusCode, error.message)
  }
  
  const response = {
    productRes
  }
  return successResponse(response)
}

