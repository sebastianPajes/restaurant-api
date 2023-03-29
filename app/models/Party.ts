import { Expose, Type } from "class-transformer"
import { IsBoolean, IsDefined, IsEnum, IsNumber, IsOptional, IsString, ValidateNested } from "class-validator"
import { CommonEventValidator } from "./eventValidators/CommonEventValidators"
import { randomUUID } from "crypto"

export interface IPartyContract {
    employeeId?: string,
    notes?: string,
    waitingTime: string,
    tableCodes?: string[],
    tags?: string[],
    active: boolean,
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
    id: string = randomUUID()
    @Expose()
    notes: string
    @Expose()
    waitingTime: string
    @Expose()
    tableCodes: string[]
    @Expose()
    tags: string[]
    @Expose()
    @IsBoolean()
    @IsOptional()
    active: boolean = true;
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
    name: string
    @Expose()
    @IsDefined()
    @IsString()
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