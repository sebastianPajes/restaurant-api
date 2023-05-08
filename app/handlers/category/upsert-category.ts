import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { ICategory } from '../../models/Category';
import { APIGatewayProxyHandler } from "aws-lambda";
import { ICreateCategoryInDto } from '../../models/dtos/CategoryInDto';
import { getLocationIdFromToken } from "../../lib/utils";
import { CategoryRepository } from '../../repositories/Category/CategoryRepository';


export const handler: APIGatewayProxyHandler = async (event, context) => apiGatewayWrapper({
  context,
  callback: async () => {
  
  console.log("request:", JSON.stringify(event, undefined, 2));
  const locationId = getLocationIdFromToken(event);
  const eventBody: ICreateCategoryInDto = (event.body ? JSON.parse(event.body) : {});
  let response;
  //TODO: upload image to S3 and save its assetKey

  const category: ICategory = {
    name: eventBody.name,
    description: eventBody.description,
    isVisibleInMenu: true,
    assetKey: eventBody.assetKey
  };

  if (event.httpMethod === 'POST') {
    response = await CategoryRepository.create(locationId, category)
  } else if (event.httpMethod === 'PUT') {
    response = await CategoryRepository.update(locationId, eventBody.id, category)
  } else {
    throw new Error(`Unsupported method: ${event.httpMethod}`);
  }

  return { message: 'Success', data: {response} }
}
})

