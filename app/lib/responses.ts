export const successResponse = (data: any) => {
    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Credentials': true,
        'Access-Control-Allow-Headers':
          'Content-Type,X-Amz-Date,Authorization,X-Api-Key,X-Amz-Security-Token',
        'Access-Control-Allow-Methods': '*',
      },
      body: JSON.stringify(data),
    }
  }
  
  export const errorResponse = (statusCode: number, errorMessage: string) => {
    return { statusCode, body: JSON.stringify({ error: errorMessage }) }
  }
  