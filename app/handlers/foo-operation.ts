import { APIGatewayEvent } from 'aws-lambda'

/**
 * Your lambda handler
 * see infra/stacks.ts for to see where this function is created
 */
export const handler = async (event: APIGatewayEvent) => {
  
  
  
  
  console.log("hi:", JSON.stringify(event, undefined, 2));
  return { 
    statusCode: 200, 
    headers: { "Content-Type": "text/plain" },
    body: "Hello World"
   }
}

