import { Uuid } from "aws-sdk/clients/groundstation";
import { v4 as uuidv4 } from "uuid";

const generateKey = (key: string, value: string | number | boolean) =>
  `${key}#${value}`.toLowerCase().replace(/\s/g, '')

const getPartitionKey = (locationId: string) => ({
  pk: generateKey('locationId', locationId),
})

export const getEmployeePrimaryKeys = (
  locationId:string,
  cognitoUsername:string
): { pk: string; sk: string } => {
  return {
      ...getPartitionKey(locationId),
      sk:generateKey('cognitoUsername',cognitoUsername)
    }
}

export const getLocationPrimaryKeysV2 = (
): { pk: Uuid } => {
  const locationId = uuidv4();
  return { ...getPartitionKey(locationId) }; 
}


export const getCategoryKeys = (
  locationId: string,
): { pk: string; sk: Uuid } => {
  const categoryId = uuidv4();
  return { ...getPartitionKey(locationId),sk:generateKey('categoryId',categoryId)} 
}


export const getProductKeys = (
  locationId: string,
  categoryId?:string
): { pk: Uuid; sk: string } => {
  const productId = uuidv4();
  return {
      ...getPartitionKey(locationId),
      sk: `${categoryId?generateKey('categoryId', categoryId)+'/':''}${generateKey('productId',productId)}`
    }
}


export const getCartKeys = (
  companyId: string,
  restaurantId: string,
  sessionId: string,
): { pk: string; sk: string } => {
  const keys = {
    pk: `${generateKey('companyId', companyId)}/${generateKey('restaurantId', restaurantId)}`,
    sk: `${generateKey('sessionid', sessionId)}/cart`,
  }
  return keys
}

export const getCartProductsKeys = (
  companyId: string,
  restaurantId: string,
  sessionId: string,
): { pk: string; sk: string } => {
  const keys = {
    pk: `${generateKey('companyId', companyId)}/${generateKey('restaurantId', restaurantId)}`,
    sk: `${generateKey('sessionid', sessionId)}/productid#`,
  }
  return keys
}


export const getTableKeys = (
  locationId: string,
  code: string,
): { pk: string; sk: string } => {
  const keys = {
    pk: generateKey('locationId', locationId),
    sk: generateKey('code', code),
  }
  return keys
}

interface DynamoKeys {
  pk: Record<string, string | number | boolean>;
  sk?: Record<string, string | number | boolean>;
}

export function formatDynamoKeys(keys: DynamoKeys): { pk: string; sk?: string } {
  const pkValues = Object.entries(keys.pk).map(([key, value]) => generateKey(key, value)).join("-");
  if (!keys.sk) return { pk: pkValues }
  const skValues = Object.entries(keys.sk).map(([key, value]) => generateKey(key, value)).join("-");

  console.log(pkValues, skValues)
  return { pk: pkValues, sk: skValues };
}
