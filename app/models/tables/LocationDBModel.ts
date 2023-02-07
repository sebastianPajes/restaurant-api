import dynamoose from '../dynamoose'
import { Document } from 'dynamoose/dist/Document'
import { SchemaDefinition } from 'dynamoose/dist/Schema'
import { ILocation} from '../Location'

export interface ILocationSchema extends ILocation,Document {
  pk: string
}


export const LocationDefinition: SchemaDefinition = {
    pk: {
      type: String,
      hashKey: true,
    },
    name: {
      type: String,
      required: true
    }
  }
  



const LocationSchema = new dynamoose.Schema(LocationDefinition)

export const LocationDBModel = dynamoose.model<ILocationSchema>(
  `${process.env.LOCATION_TABLE_NAME}`,
  LocationSchema,
  {
    create: false,
    waitForActive: { enabled: false },
  },
)
