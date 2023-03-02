import { Uuid } from "aws-sdk/clients/groundstation";
import { lutimesSync } from "fs";
import { v4 as uuidv4 } from "uuid";

const generateKey = (key: string, value: string | number | boolean) =>
  `${key}#${value}`.toLowerCase().replace(/\s/g, '')

const generateKey2 = (key: string, value: string | number | boolean,key2: string, value2: string | number | boolean) =>
  `${key}#${value}-${key2}#${value2}`.toLowerCase().replace(/\s/g, '')

const getPartitionKey = (companyId: string) => ({
  pk: generateKey('companyId', companyId),
})

const getSortKey = (locationId: string) => ({
  sk: generateKey('locationId', locationId),
})

const getSortKey2 = (locationId: string, categoryId: string) => ({
  sk: generateKey2('locationId', locationId,'categoryId', categoryId),
})

export const getEmployeePrimaryKeys = (
  companyId: string,
  locationId?: string,
): { pk: string; sk?: string } => {
  if (locationId) {
    return {
      ...getPartitionKey(companyId),
      ...getSortKey(locationId),
    }
  } else {
    return {
      ...getPartitionKey(companyId),
      sk: 'locationId',
    }
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
  const pk = uuidv4();
  return { pk }; 
}


export const getCategoryKeys = (
  locationId?: string,
): { pk: Uuid; sk?: string } => {
  const pk = uuidv4();
  return locationId ? { pk, ...getSortKey(locationId) } 
                        : { pk, sk: 'locationId' };
}


export const getProductKeys = (
  locationId: string,
  categoryId:string
): { pk: Uuid; sk?: string } => {
  const pk = uuidv4();
  return { pk, ...getSortKey2(locationId,categoryId) }
}


export const getCartKeys = (
  companyId: string,
  restaurantId: string,
  sessionId: string,
): { pk: string; sk: string } => {
  const keys = {
    pk: `${generateKey('companyId', companyId)}-${generateKey('restaurantId', restaurantId)}`,
    sk: `${generateKey('sessionid', sessionId)}-cart`,
  }
  return keys
}

export const getCartProductsKeys = (
  companyId: string,
  restaurantId: string,
  sessionId: string,
): { pk: string; sk: string } => {
  const keys = {
    pk: `${generateKey('companyId', companyId)}-${generateKey('restaurantId', restaurantId)}`,
    sk: `${generateKey('sessionid', sessionId)}-productid#`,
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
