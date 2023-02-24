import dynamoose from '../dynamoose'
import { Document } from 'dynamoose/dist/Document'
import { SchemaDefinition } from 'dynamoose/dist/Schema'
import { ICategory } from '../Category';

export interface ICategorySchema extends ICategory, Document {
  pk: string;
  sk: string;
}

export const CategoryDefinition: SchemaDefinition = {
    pk: {
      type: String,
      hashKey: true,
    },
    sk: {
      type: String,
      rangeKey: true
    },
    locationId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    assetKey: {
      type: String}
  }
  


const CategorySchema = new dynamoose.Schema(CategoryDefinition)

export const CategoryDBModel = dynamoose.model<ICategorySchema>(
  `${process.env.CATEGORY_TABLE_NAME}`,
  CategorySchema,
  {
    create: false,
    waitForActive: { enabled: false },
  },
)
