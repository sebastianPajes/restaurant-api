import { getEmployeePrimaryKeysV2 } from "../../lib/helpers/primaryKey"
import { IEmployee } from "../../models/Employee";
import { EmployeeDBModel } from "../../models/tables/EmployeeDBModel";

export const EmployeeRepository = {
    create: async(restaurantId: string, employee: IEmployee) => {
    const primaryKey = getEmployeePrimaryKeysV2(restaurantId);
        return EmployeeDBModel.create({ ...primaryKey, ...employee })
    }
}