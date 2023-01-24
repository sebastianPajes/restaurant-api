export interface IEmployee {
    restaurantId: string
    firstName: string
    lastName: string
    email: string
    tableIds?: Array<string>
    roleId: string
    cognitoUsername: string
}

export class Employee implements IEmployee {
    restaurantId: string
    firstName: string
    lastName: string
    email: string
    tableIds?: Array<string>
    roleId: string
    cognitoUsername: string
}
