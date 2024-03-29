import { Expose } from "class-transformer"
import { IsDefined, IsEmail, IsEnum, IsOptional, IsPhoneNumber, IsString } from "class-validator"
import { randomUUID } from "crypto"

// deprecated
export interface ILocation{
    name:string
}

enum DayOfWeek {
    Monday = 'Monday',
    Tuesday = 'Tuesday',
    Wednesday = 'Wednesday',
    Thursday = 'Thursday',
    Friday = 'Friday',
    Saturday = 'Saturday',
    Sunday = 'Sunday'
  }

export interface ILocationContract {
    name: string,
    qrCodeWaitlist: string,
    address: string,
    businessHours: {
        [key in DayOfWeek]?: string;
    },
    defaultWaitingTime: string,
    phone?: string
}

export class UpdateLocationInDTO implements Omit<ILocationContract, 'qrCodeWaitlist'> {
    @Expose()
    @IsDefined()
    @IsString()
    name: string
    @Expose()
    @IsDefined()
    @IsString()
    address: string
    @Expose()
    @IsOptional()
    businessHours: {
        [key in DayOfWeek]?: string;
    }
    @Expose()
    @IsDefined()
    @IsString()
    defaultWaitingTime: string
    @Expose()
    @IsOptional()
    @IsPhoneNumber('PE')
    phone: string
}

export class CreateLocationInDTO implements Omit<ILocationContract, 'qrCodeWaitlist'> {
    @Expose()
    @IsString()
    @IsOptional()
    id: string = randomUUID()
    @Expose()
    @IsDefined()
    @IsString()
    name: string
    @Expose()
    @IsOptional()
    @IsString()
    address: string
    @Expose()
    @IsOptional()
    businessHours: {
        [key in DayOfWeek]?: string;
    }
    @Expose()
    @IsDefined()
    @IsString()
    defaultWaitingTime: string
    @Expose()
    @IsDefined()
    @IsEmail()
    email: string
    @Expose()
    @IsDefined()
    @IsString()
    password: string
    @Expose()
    @IsDefined()
    @IsPhoneNumber('PE')
    phone: string
    @Expose()
    @IsDefined()
    @IsString()
    firstName: string
    @Expose()
    @IsDefined()
    @IsString()
    lastName: string
}

export interface ICreateLocationParams {
    primaryKeys: ILocationPrimaryKeyParams
    attr: ILocationContract
}
export interface IUpdateLocationParams {
    primaryKeys: ILocationPrimaryKeyParams,
    attr: Omit<ILocationContract, 'qrCodeWaitlist'>
}
export interface ILocationPrimaryKeyParams {
    id: string
}
