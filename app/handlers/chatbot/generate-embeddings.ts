import 'reflect-metadata';
import { APIGatewayProxyHandler } from 'aws-lambda';
import { apiGatewayWrapper } from '../../lib/helpers/wrappers/apiGatewayWrapper';
import { MemoryVectorStore } from "langchain/vectorstores/memory";
import { OpenAIEmbeddings } from 'langchain/embeddings/openai';
import { CharacterTextSplitter } from 'langchain/text_splitter';
import * as AWS from 'aws-sdk';

async function uploadDataToS3(s3: AWS.S3, bucketName: string, key: string, data: any) {

  const buffer = Buffer.from(JSON.stringify(data));

  await s3.putObject({
    Bucket: bucketName,
    Key: key,
    Body: buffer,
    ContentType: 'application/json'
  }).promise()
  console.log(`Object uploaded successfully to bucket ${bucketName}`);
  console.log(`Object URL: https://${bucketName}.s3.amazonaws.com/${key}`);

}

async function getFileFromS3(s3: AWS.S3, bucketName: string, key: string): Promise<string> {
  const data = await s3.getObject({ Bucket: bucketName, Key: key }).promise();
  return data.Body.toString();
}

export const handler: APIGatewayProxyHandler = async (event, context) =>
  apiGatewayWrapper({
    context,
    callback: async () => {
      console.log('request:', JSON.stringify(event, undefined, 2));

      const openAIApiKey = process.env.OPEN_AI_KEY;

      // Leer el archivo 'restaurant.txt' desde el bucket de S3
      const bucketName = process.env.BUCKET;
      const bucketKey = process.env.BUCKET_KEY;
      if (!bucketName) {
        throw new Error('Bucket name not found in environment variables');
      }
      const s3 = new AWS.S3();
      const restaurantFileKey = 'restaurant.txt'; // TODO: use dynamoDB tables to generate its content
      const text = await getFileFromS3(s3, bucketName, restaurantFileKey);

      const textSplitter = new CharacterTextSplitter({ chunkSize: 1, chunkOverlap: 0, separator: '#' });
      const docs = await textSplitter.createDocuments([text]);

      console.log(docs);

      const vectorStore = await MemoryVectorStore.fromDocuments(docs, new OpenAIEmbeddings({ openAIApiKey }));

      // Subir el directorio "vectorDB" a S3
      await uploadDataToS3(s3, bucketName, bucketKey, vectorStore.memoryVectors);

      return { message: 'Success', data: { vectorStore } };
    },
  });
