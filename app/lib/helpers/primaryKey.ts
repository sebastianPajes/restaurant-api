
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

// export const getTenantSummaryPrimaryKeys = (companyId?: string) => {
//   if (companyId) {
//     return {
//       pk: 'summary',
//       sk: generateKey(RetailerConfigKeyNames.TENANT_ID, companyId),
//     }
//   }
//   return { pk: `summary` }
// }
