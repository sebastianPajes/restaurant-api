import { APIGatewayEvent } from 'aws-lambda'
import { errorResponse, successResponse } from '../lib/responses';
import { ICategory } from '../models/Category';
import { ICreateCategoryInDto } from '../models/dtos/CategoryInDto';
import { CreateCategoryService } from '../services/Category/CreateCategoryService';


export const handler = async (event: APIGatewayEvent) => {
  
  console.log("request:", JSON.stringify(event, undefined, 2));
  const eventBody: ICreateCategoryInDto = (event.body ? JSON.parse(event.body) : {});
  let categoryRes;
  try {
    //TODO: upload image to S3 and save its assetKey

    const category: ICategory = {
      locationId: eventBody.locationId,
      name:eventBody.name
    };
    categoryRes = await CreateCategoryService.create(category.locationId, category);
  } catch (error) {
    return errorResponse(error.statusCode, error.message)
  }
  
  const response = {
    categoryRes
  }
  return successResponse(response)
}

