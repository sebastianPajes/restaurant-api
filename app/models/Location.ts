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
    }
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
    // @IsEnum(DayOfWeek, { each: true })
    businessHours: {
        [key in DayOfWeek]?: string;
    }
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

export interface ILocationPrimaryKeyParams {
    id: string
}
