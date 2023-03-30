import { getEmployeePrimaryKeys } from "../../lib/helpers/primaryKey"
import { IEmployee } from "../../models/Employee";
import { EmployeeDBModel } from "../../models/tables/EmployeeDBModel";

export const EmployeeRepository = {
    create: async(locationId: string, cognitoUsername:string, employee: IEmployee) => {
    const employeeKeys = getEmployeePrimaryKeys(locationId, cognitoUsername);
        return await EmployeeDBModel.create({ ...employeeKeys, ...employee });
    },
    update: async(locationId: string, cognitoUsername:string, employee: IEmployee) => {
        const primaryKey = getEmployeePrimaryKeys(locationId, cognitoUsername)
        return await EmployeeDBModel.update({...primaryKey, ...employee});
    },
    getByCognitoUser: async(locationId: string, cognitoUsernameParam:string) => {
        const employeeKeys = getEmployeePrimaryKeys(locationId, cognitoUsernameParam)
        return await EmployeeDBModel.query('pk')
        .eq(employeeKeys.pk)
        .and()
        .where('sk')
        .eq(employeeKeys.sk)
        .exec();
    },
    delete: async (locationId: string, cognitoUsername:string) => {
        const primaryKey = getEmployeePrimaryKeys(locationId, cognitoUsername)
        return await EmployeeDBModel.delete(primaryKey);
    }
}