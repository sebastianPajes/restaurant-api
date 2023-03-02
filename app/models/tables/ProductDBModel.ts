import dynamoose from '../dynamoose'
import { Document } from 'dynamoose/dist/Document'
import { SchemaDefinition } from 'dynamoose/dist/Schema'
import { IProduct } from '../Product';

export interface IProductSchema extends IProduct, Document {
  pk: string;
  sk: string;
}

export const ProductDefinition: SchemaDefinition = {
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
    categoryId: {
      type: String,
      required: true
    },
    name: {
      type: String,
      required: true
    },
    description: {
      type: String
    },
    price: {
      type: Number,
      required:true
    },
    isVisibleInMenu: {
      type: Boolean
    },
    assetKey: {
      type: String
    }
  }
  


const ProductSchema = new dynamoose.Schema(ProductDefinition)

export const ProductDBModel = dynamoose.model<IProductSchema>(
  `${process.env.PRODUCT_TABLE_NAME}`,
  ProductSchema,
  {
    create: false,
    waitForActive: { enabled: false },
  },
)
