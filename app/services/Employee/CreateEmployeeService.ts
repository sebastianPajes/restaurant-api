import { IEmployee } from "../../models/Employee";
import { EmployeeRepository } from "../../repositories/Employee/EmployeeRepository";

export const CreateEmployeeService = {
    create: async(companyId: string, restaurantId: string, employee: IEmployee) => {
        if (!employee) return;
        return EmployeeRepository.create(companyId, restaurantId, employee)
    }
};