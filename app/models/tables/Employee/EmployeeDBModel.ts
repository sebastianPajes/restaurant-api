import dynamoose from "../../dynamoose";

import { EmployeeSchema, IEmployeeSchema } from "./schema";

export const EmployeeDBModel = dynamoose.model<IEmployeeSchema>(`${process.env.EMPLOYEE_TABLE_NAME}`, EmployeeSchema, {
    create: false,
    waitForActive: { enabled: false }
})