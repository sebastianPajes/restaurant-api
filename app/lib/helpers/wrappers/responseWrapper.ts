import { APIGatewayProxyResult } from "aws-lambda"

export const responseWrapper = (statusCode: number | undefined, obj: object): APIGatewayProxyResult => {
  const status = statusCode || 500

  return {
    statusCode: status,
    body: JSON.stringify(obj),
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true,
      'Access-Control-Allow-Headers': 'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
      'Access-Control-Allow-Methods': 'OPTIONS,GET,POST,PATCH,PUT,DELETE'
    },
  }
}
