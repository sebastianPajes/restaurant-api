import { APIGatewayEvent } from 'aws-lambda'
import { errorResponse, successResponse } from '../lib/responses';
import { ICategory } from '../models/Category';
import { ICreateCategoryInDto } from '../models/dtos/CategoryInDto';
import { CreateCategoryService } from '../services/Category/CreateCategoryService';
import { getLocationIdFromToken } from "../lib/utils";


export const handler = async (event: APIGatewayEvent) => {
  
  console.log("request:", JSON.stringify(event, undefined, 2));
  const locationId = getLocationIdFromToken(event);
  const eventBody: ICreateCategoryInDto = (event.body ? JSON.parse(event.body) : {});
  let categoryRes;
  try {
    //TODO: upload image to S3 and save its assetKey

    const category: ICategory = {
      locationId,
      name:eventBody.name,
      description:eventBody.description,
      isVisibleInMenu:true

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

