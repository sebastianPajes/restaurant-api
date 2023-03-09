import { Uuid } from "aws-sdk/clients/groundstation";
import { lutimesSync } from "fs";
import { v4 as uuidv4 } from "uuid";

const generateKey = (key: string, value: string | number | boolean) =>
  `${key}#${value}`.toLowerCase().replace(/\s/g, '')

const generateKey2 = (key: string, value: string | number | boolean,key2: string, value2: string | number | boolean) =>
  `${key}#${value}-${key2}#${value2}`.toLowerCase().replace(/\s/g, '')

const getPartitionKey = (locationId: string) => ({
  pk: generateKey('locationId', locationId),
})

const getSortKey = (locationId: string) => ({
  sk: generateKey('sk', locationId),
})

const getSortKey2 = (locationId: string, categoryId: string) => ({
  sk: generateKey2('locationId', locationId,'sk', categoryId),
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

export const getEmployeePrimaryKeysV2 = (
  locationId?: string,
): { pk: Uuid; sk?: string } => {
  const pk = uuidv4();
  return locationId ? { pk, ...getSortKey(locationId) } 
                        : { pk, sk: 'restaurantId' };
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

// export const getTenantSummaryPrimaryKeys = (companyId?: string) => {
//   if (companyId) {
//     return {
//       pk: 'summary',
//       sk: generateKey(RetailerConfigKeyNames.TENANT_ID, companyId),
//     }
//   }
//   return { pk: `summary` }
// }
