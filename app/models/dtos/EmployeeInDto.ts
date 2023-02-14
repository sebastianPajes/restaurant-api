
export interface ICreateEmployeeInDto{
    locationId:string,
    email: string,
    password: string,
    phone: string,
    firstName: string,
    lastName: string,
    tableIds?: Array<string>,
    roleId?: string
}

export interface IGetEmployeeInDto{
    email: string
}
export interface IGetEmployeeOutDto{
    locationId:string,
    firstName: string,
    lastName: string,
    tableIds?: Array<string>,
    roleId?: string
}




// export class Employee implements IEmployee { //ask
//     restaurantId: string
//     created: boolean
//     modified: string
//     deleted: string
//     active:boolean
//     firstName: string
//     lastName: string
//     email: string
//     tableIds?: Array<string>
//     roleId: string
//     cognitoUsername: string
    
// }
