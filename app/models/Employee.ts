export interface IEmployee {
    companyId: string
    restaurantId: string
    firstName: string
    lastName: string
    email: string
    tableIds?: Array<string>
    roleId: string
    cognitoUsername: string
}

export class Employee implements IEmployee {
    companyId: string
    restaurantId: string
    firstName: string
    lastName: string
    email: string
    tableIds?: Array<string>
    roleId: string
    cognitoUsername: string
}
