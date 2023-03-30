import { Uuid } from "aws-sdk/clients/groundstation";
import { v4 as uuidv4 } from "uuid";

const generateKey = (key: string, value: string | number | boolean) =>
  `${key}#${value}`.toLowerCase().replace(/\s/g, '')

const generateKey2 = (key: string, value: string | number | boolean,key2: string, value2: string | number | boolean) =>
  `${key}#${value}-${key2}#${value2}`.toLowerCase().replace(/\s/g, '')

const getPartitionKey = (companyId: string) => ({
  pk: generateKey('companyId', companyId),
})

const getLocationSortKey = (locationId: string) => ({
  sk: generateKey('locationId', locationId),
})

const getCategorySortKey = (locationId: string, categoryId: string) => ({
  sk: generateKey2('locationId', locationId,'categoryId', categoryId),
})

const getSortKey = (keyValue: string, keyName: string) => ({
  sk: generateKey(keyName, keyValue),
})

export const getEmployeePrimaryKeys = (
  companyId: string,
  locationId?: string,
): { pk: string; sk?: string } => {
  if (locationId) {
    return {
      ...getPartitionKey(companyId),
      ...getLocationSortKey(locationId),
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
  return locationId ? { pk, ...getLocationSortKey(locationId) } 
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
  return locationId ? { pk, ...getLocationSortKey(locationId) } 
                        : { pk, sk: 'locationId' };
}


export const getProductKeys = (
  locationId: string,
  categoryId:string
): { pk: Uuid; sk?: string } => {
  const pk = uuidv4();
  return { pk, ...getCategorySortKey(locationId,categoryId) }
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

const keys = {
  pk: {
    locationId: "abc"
  },
  sk: {
    partyId: "xyz",
    type: "waitlist"
  }
}

const result = {
  pk: "locationid#abc",
  sk: "partyid#xyz-type#waitlist"
}

export const getPartyKeys = (
  locationId: string,
  partyId?: string,
  type?: string,
): { pk: string; sk: string } => {
  if (partyId) {
    return {
      pk: generateKey('locationId', locationId),
      sk: `${generateKey('partyId', partyId)}-type#${type}`,
    }
  } else {
    return {
      pk: generateKey('locationId', locationId),
      sk: `${generateKey('partyId', uuidv4())}-type#${type}`,
    }
  }
}

export const getCustomerHistoryKeys = (
  locationId: string,
  customerHistoryId?: string,
): { pk: string; sk: string } => {
  if (customerHistoryId) {
    return {
      pk: generateKey('locationId', locationId),
      sk: `${generateKey('customerHistoryId', customerHistoryId)}`,
    }
  } else {
    return {
      pk: generateKey('locationId', locationId),
      sk: `${generateKey('partyId', uuidv4())}`,
    }
  }
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
