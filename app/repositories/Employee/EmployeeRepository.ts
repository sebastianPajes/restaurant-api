import { getEmployeePrimaryKeys } from "../../lib/helpers/primaryKey"
import { IEmployee } from "../../models/Employee";
import { EmployeeDBModel } from "../../models/tables/EmployeeDBModel";

export const EmployeeRepository = {
    create: async(companyId: string, restaurantId: string, employee: IEmployee) => {
    const primaryKey = getEmployeePrimaryKeys(companyId, restaurantId);
        return EmployeeDBModel.create({ ...primaryKey, ...employee })
    }
}