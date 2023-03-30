// import dynamoose from '../dynamoose'
// import { Document } from 'dynamoose/dist/Document'
// import { SchemaDefinition } from 'dynamoose/dist/Schema'
// import { IEmployee} from '../Employee'

// export interface IEmployeeSchema extends IEmployee, Document {
//   pk: string;
//   sk: string;
// }

// export const EmployeeDefinition: SchemaDefinition = {
//     pk: {
//       type: String,
//       hashKey: true,
//     },
//     sk: {
//       type: String,
//       rangeKey: true
//     },
//     locationId: {
//       type: String,
//       required: true
//     },
//     firstName: {
//       type: String,
//       required: true
//     },
//     lastName: {
//       type: String,
//       required: true
//     },
//     email: {
//       type: String,
//       required: true
//     },
//     tableIds: {
//       type: Array<String>
//     },
//     roleId: {
//       type: String
//     },
//     cognitoUsername: {
//         type: String,
//         required: true
//     },
//     isAdmin:{
//       type: Boolean,
//       required: true
//     }
//   }
  


// const EmployeeSchema = new dynamoose.Schema(EmployeeDefinition)

// export const EmployeeDBModel = dynamoose.model<IEmployeeSchema>(
//   `${process.env.EMPLOYEE_TABLE_NAME}`,
//   EmployeeSchema,
//   {
//     create: false,
//     waitForActive: { enabled: false },
//   },
// )
