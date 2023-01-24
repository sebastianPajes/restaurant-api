import dynamoose from '../dynamoose'
import { Document } from 'dynamoose/dist/Document'
import { SchemaDefinition } from 'dynamoose/dist/Schema'
import { IEmployee } from '../Employee'

export const EmployeeDefinition: SchemaDefinition = {
    pk: {
      type: String,
      hashKey: true,
    },
    sk: {
      type: String,
      rangeKey: true
    },
    restaurantId: {
      type: String,
      required: true
    },
    firstName: {
      type: String,
      required: true
    },
    lastName: {
      type: String,
      required: true
    },
    email: {
      type: String,
      required: true
    },
    tableIds: {
      type: Array<String>
    },
    roleId: {
      type: String
    },
    cognitoUsername: {
        type: String,
        required: true
    }
  }
  

export interface IEmployeeSchema extends IEmployee, Document {
    pk: string
    sk: string
}

const EmployeeSchema = new dynamoose.Schema(EmployeeDefinition)

export const EmployeeDBModel = dynamoose.model<IEmployeeSchema>(
  `${process.env.TABLE_NAME}`,
  EmployeeSchema,
  {
    create: false,
    waitForActive: { enabled: false },
  },
)
