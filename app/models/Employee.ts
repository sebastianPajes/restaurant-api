
export interface IEmployee{
    firstName: string;
    lastName: string;
    locationId:string;
    email: string;
    tableIds?: [string];
    roleId?: string;
    cognitoUsername: string; 
    isAdmin:boolean; 
}