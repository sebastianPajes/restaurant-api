import { EmployeeRepository } from "../../repositories/Employee/EmployeeRepository";

export const ListEmployeeService = {
    findByCognitoUser: async(cognitoUsername: string) => {
        if (!cognitoUsername) return;
        return  EmployeeRepository.findByCognitoUser(cognitoUsername);
    }
};