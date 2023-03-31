import { Expose } from "class-transformer";
import { IsArray, IsBoolean, IsDefined, IsEmail, IsOptional, IsPhoneNumber, IsString } from "class-validator";

// deprecated
export interface IEmployee{
    firstName: string;
    lastName: string;
    email: string;
    tableIds?: [string];
    roleId?: string;
    cognitoUsername: string; 
    isAdmin?:boolean; 
}

export interface IEmployeeContract {
    firstName: string;
    lastName: string;
    phone?: string;
    email: string;
    tableIds?: [string];
    roleId?: string; 
    isAdmin?:boolean; 
}

export class PersistEmployeeDTO implements IEmployeeContract {
    @Expose()
    @IsString()
    @IsOptional()
    id: string;
    @Expose()
    @IsDefined()
    @IsString()
    firstName: string;
    @Expose()
    @IsDefined()
    @IsString()
    lastName: string;
    @Expose()
    @IsDefined()
    @IsEmail()
    email: string;
    @Expose()
    @IsDefined()
    @IsPhoneNumber('PE')
    phone: string;
    @Expose()
    @IsDefined()
    @IsString()
    temporaryPassword: string;
    @Expose()
    @IsOptional()
    @IsArray()
    tableIds?: [string];
    @Expose()
    @IsOptional()
    roleId?: string;
    @Expose()
    @IsBoolean()
    @IsOptional()
    isAdmin?: boolean = false;
}

export interface IPersistEmployeeParams {
    primaryKeys: IEmployeePrimaryKeyParams
    attr: IEmployeeContract
}

export interface IEmployeePrimaryKeyParams {
    locationId: string
    id: string
}
