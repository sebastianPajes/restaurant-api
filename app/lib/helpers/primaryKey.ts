import { Uuid } from "aws-sdk/clients/groundstation";
import { lutimesSync } from "fs";
import { v4 as uuidv4 } from "uuid";

const generateKey = (key: string, value: string | number | boolean) =>
  `${key}#${value}`.toLowerCase().replace(/\s/g, '')

const getPartitionKey = (companyId: string) => ({
  pk: generateKey('companyId', companyId),
})

const getSortKey = (restaurantId: string) => ({
  sk: generateKey('restaurantId', restaurantId),
})

export const getEmployeePrimaryKeys = (
  companyId: string,
  restaurantId?: string,
): { pk: string; sk?: string } => {
  if (restaurantId) {
    return {
      ...getPartitionKey(companyId),
      ...getSortKey(restaurantId),
    }
  } else {
    return {
      ...getPartitionKey(companyId),
      sk: 'restaurantId',
    }
  }
}



export const getEmployeePrimaryKeysV2 = (
  restaurantId?: string,
): { pk: Uuid; sk?: string } => {
  const pk = uuidv4();
  return restaurantId ? { pk, ...getSortKey(restaurantId) } 
                        : { pk, sk: 'restaurantId' };
}

export const getLocationPrimaryKeysV2 = (
): { pk: Uuid } => {
  const pk = uuidv4();
  return { pk }; 
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
