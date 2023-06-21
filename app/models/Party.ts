import { Expose, Type } from "class-transformer"
import { IsBoolean, IsDefined, IsEnum, IsISO8601, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, ValidateNested } from "class-validator"
import { CommonEventValidator } from "./eventValidators/CommonEventValidators"

export interface IPartyContract {
    employeeId?: string,
    notes?: string,
    waitingTime?: string, // waitlist / minutes range
    dateTime?: string, // booking / ISO8601
    duration?: number, // booking / hours
    tableCodes?: string[],
    tags?: string[],
    seated: boolean,
    deleted?: boolean,
    source: PartySource,
    customer: ICustomerContract
}

export enum PartySource {
    MANUAL = 'manual',
    CUSTOMER = 'customer'
}

export enum PartyTypes {
    BOOKING = 'booking',
    WAITLIST = 'waitlist'
}

export class PartyInDTO implements IPartyContract, Omit<IPartyPrimaryKeyParams, 'locationId' | 'type'> {
    @Expose()
    @IsString()
    @IsOptional()
    id: string
    @Expose()
    @IsBoolean()
    @IsOptional()
    notify: boolean = false
    @Expose()
    notes: string
    @Expose()
    @IsString()
    @IsOptional()
    waitingTime: string
    @Expose()
    @IsISO8601()
    @IsOptional()
    dateTime: string // Ex: 2023-03-30T13:00:00
    @Expose()
    @IsOptional()
    @IsNumber()
    duration: number // in hours
    @Expose()
    tableCodes: string[] = []
    @Expose()
    tags: string[]
    @Expose()
    @IsBoolean()
    @IsOptional()
    seated: boolean = false;
    @Expose()
    @IsBoolean()
    @IsOptional()
    deleted: boolean = false;
    @Expose()
    @IsDefined()
    @IsEnum(PartySource)
    source: PartySource
    @Expose()
    @IsDefined()
    @ValidateNested()
    @Type(() => CustomerInDTO)
    customer: CustomerInDTO
}

export class UpsertPartyEventValidator extends CommonEventValidator {
    @Expose()
    @IsDefined()
    @IsEnum(PartyTypes)
    type: PartyTypes
}

export class FindPartyByTypeEventValidator extends CommonEventValidator {
    @Expose()
    @IsDefined()
    @IsEnum(PartyTypes)
    type: PartyTypes
}

export class GetPartyByIdEventValidator extends CommonEventValidator {
    @Expose()
    @IsDefined()
    @IsString()
    id: string

    @Expose()
    @IsDefined()
    @IsEnum(PartyTypes)
    type: PartyTypes
}

export class DeletePartyEventValidator extends CommonEventValidator {
    @Expose()
    @IsDefined()
    @IsString()
    id: string

    @Expose()
    @IsDefined()
    @IsEnum(PartyTypes)
    type: PartyTypes
}

export interface IPartyUpdateParams {
    primaryKeys: IPartyPrimaryKeyParams
    attr: IPartyContract
}

export interface IPartyPrimaryKeyParams {
    locationId: string,
    type: PartyTypes,
    id: string,
}

export class CustomerInDTO implements ICustomerContract {
    @Expose()
    @IsDefined()
    @IsString()
    @IsNotEmpty()
    name: string
    @Expose()
    @IsDefined()
    @IsString()
    @IsPhoneNumber('PE')
    phone: string
    @Expose()
    @IsDefined()
    @IsNumber()
    partySize: number
    @Expose()
    @IsBoolean()
    accepted: boolean = true;
}

export interface ICustomerContract {
    name: string,
    phone: string,
    partySize: number,
    accepted?: boolean
}