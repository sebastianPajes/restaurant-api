import { APIGatewayEvent } from 'aws-lambda'
import {S3} from 'aws-sdk';
import { errorResponse, successResponse } from '../lib/responses';


// Change this value to adjust the signed URL's expiration
const URL_EXPIRATION_SECONDS = 300

const s3 = new S3();
export const handler = async (event: APIGatewayEvent) => {
  
  console.log("request:", JSON.stringify(event, undefined, 2));
  const Key = event.pathParameters?.fileName;

  const s3Params = {
    Bucket: process.env.BUCKET,
    Key,
    Expires: URL_EXPIRATION_SECONDS,
    ContentType: 'image/jpeg',

    // This ACL makes the uploaded object publicly readable. You must also uncomment
    // the extra permission for the Lambda function in the SAM template.

    // ACL: 'public-read'
  };
  console.log('Params: ', s3Params);
  
  let uploadURL;
  try {
    if (!Key) throw new Error("The 'fileName' pathParameter is missing.");
    uploadURL = await s3.getSignedUrlPromise('putObject', s3Params);  
  } catch (error) {
    return errorResponse(error.statusCode, error.message);
  }

  return successResponse({uploadURL});
}
