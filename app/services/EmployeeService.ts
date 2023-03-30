import { IEmployee } from "../models/Employee";
import { EmployeeRepository } from "../repositories/Employee/EmployeeRepository";

export const EmployeeService = {
    create: async(locationId: string, cognitoUsername: string, employee: IEmployee) => {
        if (!employee) return;
        return EmployeeRepository.create(locationId, cognitoUsername, employee)
    },
    update: async (locationId: string, cognitoUsername: string, employee: IEmployee) => {
        return await EmployeeRepository.update(locationId, cognitoUsername, employee)
    },
    getByCognitoUser: async(locationId:string, cognitoUsername: string) => {
        if (!cognitoUsername) return;
        return  EmployeeRepository.getByCognitoUser(locationId, cognitoUsername);
    },
    delete: async (locationId: string, cognitoUsername: string) => {
        return await EmployeeRepository.delete(locationId, cognitoUsername);
    }  
};