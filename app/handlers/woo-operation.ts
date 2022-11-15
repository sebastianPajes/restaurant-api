import { SQSEvent } from 'aws-lambda'
import { config } from '../config'

/**
 * Your lambda handler
 * see infra/stacks.ts for to see where this function is created
 */
export const handler = async (event: SQSEvent) => {
  // function code goes here
  const body = JSON.stringify(event);
  console.log("request: ", body);
  return { statusCode: 200, body }
}
